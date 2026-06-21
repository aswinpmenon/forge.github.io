import { writable, derived, get } from 'svelte/store';
import { supabase } from '../supabase.js';
import { user } from './auth.js';

export const calLog = writable([]);
export const workoutLog = writable([]);
export const runLog = writable([]);
export const userStats = writable(null);
export const routineDone = writable([]); // block_ids completed today
export const bodyStats = writable([]);
export const goal = writable(2400);
export const loading = writable(false);

export function today() {
  return new Date().toISOString().split('T')[0];
}
export function dayName(d = new Date()) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
}

function uid() {
  return get(user)?.id;
}

/* ---------- loading ---------- */
export async function loadAll() {
  const id = uid();
  if (!id) return;
  loading.set(true);
  const [cal, wk, run, cfg, stats, body, routine] = await Promise.all([
    supabase.from('calorie_log').select('*').eq('owner_id', id).order('id', { ascending: false }),
    supabase.from('workout_log').select('*').eq('owner_id', id).order('id', { ascending: false }),
    supabase.from('run_log').select('*').eq('owner_id', id).order('id', { ascending: false }),
    supabase.from('app_config').select('setting,value').eq('owner_id', id),
    supabase.from('user_stats').select('*').eq('user_id', id).maybeSingle(),
    supabase.from('body_stats').select('*').eq('user_id', id).order('date', { ascending: false }),
    supabase.from('routine_log').select('block_id').eq('user_id', id).eq('date', today())
  ]);
  calLog.set(cal.data ?? []);
  workoutLog.set(wk.data ?? []);
  runLog.set(run.data ?? []);
  bodyStats.set(body.data ?? []);
  routineDone.set((routine.data ?? []).map((r) => r.block_id));
  const g = (cfg.data ?? []).find((r) => r.setting === 'Calorie_Goal_Daily');
  if (g) goal.set(Number(g.value) || 2400);
  await ensureStats(stats.data);
  loading.set(false);
}

async function ensureStats(existing) {
  const id = uid();
  if (existing) {
    userStats.set(existing);
    return;
  }
  const email = get(user)?.email ?? '';
  const fresh = { user_id: id, email, xp: 0, level: 1, streak: 0, last_active: today() };
  await supabase.from('user_stats').upsert(fresh, { onConflict: 'user_id' });
  userStats.set(fresh);
}

/* ---------- nutrition ---------- */
export async function addFood({ course, name, calories, protein = 0, carbs = 0, fat = 0, location = 'Home' }) {
  const id = uid();
  const row = {
    owner_id: id,
    id: Date.now(),
    date: today(),
    day: dayName(),
    course,
    calories_kcal: Math.round(calories),
    timestamp: new Date().toISOString(),
    location,
    notes: JSON.stringify({ name, protein, carbs, fat })
  };
  calLog.update((l) => [row, ...l]);
  const { error } = await supabase.from('calorie_log').insert(row);
  if (error) calLog.update((l) => l.filter((r) => r.id !== row.id));
  return error;
}

export async function deleteFood(rowId) {
  calLog.update((l) => l.filter((r) => r.id !== rowId));
  return (await supabase.from('calorie_log').delete().eq('id', rowId).eq('owner_id', uid())).error;
}

export async function setGoal(value) {
  goal.set(value);
  await supabase
    .from('app_config')
    .upsert([{ owner_id: uid(), setting: 'Calorie_Goal_Daily', value: String(value) }], {
      onConflict: 'owner_id,setting'
    });
}

/* ---------- workouts ---------- */
export async function addWorkoutSets(sessionId, sets) {
  const id = uid();
  const rows = sets.map((s, i) => ({
    owner_id: id,
    id: Date.now() + i,
    date: today(),
    day: dayName(),
    session_id: sessionId,
    exercise: s.exercise,
    muscle_group: s.muscle_group || '',
    set_no: s.set_no,
    weight_lbs: s.weight_lbs,
    reps: s.reps,
    notes: s.notes || ''
  }));
  workoutLog.update((l) => [...rows, ...l]);
  const { error } = await supabase.from('workout_log').insert(rows);
  return error;
}

/* ---------- runs ---------- */
export async function addRun(run) {
  const id = uid();
  const row = {
    owner_id: id,
    id: Date.now(),
    date: today(),
    day: dayName(),
    start_timestamp: run.start,
    end_timestamp: run.end,
    duration_sec: run.duration_sec,
    distance_km: run.distance_km,
    avg_pace_sec_per_km: run.pace,
    estimated_steps: run.steps,
    estimated_calories: run.calories,
    path_json: run.path ?? null
  };
  runLog.update((l) => [row, ...l]);
  const { error } = await supabase.from('run_log').insert(row);
  return error;
}

/* ---------- routine ---------- */
export async function completeBlock(blockId, activityType) {
  routineDone.update((d) => (d.includes(blockId) ? d : [...d, blockId]));
  await supabase
    .from('routine_log')
    .insert({ user_id: uid(), block_id: blockId, activity_type: activityType, date: today() });
}

/* ---------- morning check-in + streak ---------- */
function yesterdayIso() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export async function doCheckin(sleepHours) {
  const id = uid();
  const stats = get(userStats) ?? { streak: 0, xp: 0, level: 1, last_active: null };

  let streak = stats.streak || 0;
  if (stats.last_active === today()) {
    // already checked in today — no change
  } else if (stats.last_active === yesterdayIso()) {
    streak += 1;
  } else {
    streak = 1;
  }
  const xp = (stats.xp || 0) + 10;
  const level = Math.floor(xp / 100) + 1;
  const next = { user_id: id, email: get(user)?.email ?? '', xp, level, streak, last_active: today() };

  userStats.set(next);
  await supabase.from('user_stats').upsert(next, { onConflict: 'user_id' });
  await completeBlock(1, 'checkin');
  await supabase.from('routine_log').insert({ user_id: id, block_id: 0, activity_type: 'sleep', date: today() }).then(() => {}, () => {});
  return { streak, sleepHours };
}

export function checkedInToday() {
  return get(routineDone).includes(1);
}

/* ---------- body stats ---------- */
export async function logWeight(weightKg) {
  const row = { user_id: uid(), weight_kg: parseFloat(weightKg), date: today() };
  bodyStats.update((b) => [row, ...b]);
  await supabase.from('body_stats').insert(row);
}

/* ---------- export / clear ---------- */
function download(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

export function exportJson() {
  const data = {
    exported_at: new Date().toISOString(),
    calorie_log: get(calLog),
    workout_log: get(workoutLog),
    run_log: get(runLog),
    body_stats: get(bodyStats),
    user_stats: get(userStats),
    goal: get(goal)
  };
  download(`forge-export-${today()}.json`, JSON.stringify(data, null, 2), 'application/json');
}

export function exportCsv(table) {
  const map = { calorie_log: calLog, workout_log: workoutLog, run_log: runLog, body_stats: bodyStats };
  const rows = get(map[table] ?? calLog);
  download(`forge-${table}-${today()}.csv`, toCsv(rows), 'text/csv');
}

export async function clearAll() {
  const id = uid();
  await Promise.all([
    supabase.from('calorie_log').delete().eq('owner_id', id),
    supabase.from('workout_log').delete().eq('owner_id', id),
    supabase.from('run_log').delete().eq('owner_id', id)
  ]);
  calLog.set([]);
  workoutLog.set([]);
  runLog.set([]);
}

/* ---------- derived: today's nutrition ---------- */
function parseNotes(n) {
  try {
    return JSON.parse(n);
  } catch {
    return {};
  }
}

export const todayFood = derived(calLog, ($cal) =>
  $cal.filter((r) => r.date === today())
);

export const todayTotals = derived(todayFood, ($food) => {
  let kcal = 0, protein = 0, carbs = 0, fat = 0;
  for (const r of $food) {
    kcal += r.calories_kcal || 0;
    const m = parseNotes(r.notes);
    protein += m.protein || 0;
    carbs += m.carbs || 0;
    fat += m.fat || 0;
  }
  return {
    kcal,
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat)
  };
});

export const foodName = (row) => parseNotes(row.notes).name || row.course || 'Meal';
