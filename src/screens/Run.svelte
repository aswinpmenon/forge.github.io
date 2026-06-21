<script>
  import Glass from '../lib/components/Glass.svelte';
  import Icon from '../lib/components/Icon.svelte';
  import Ring from '../lib/components/Ring.svelte';
  import { addRun, runLog, today } from '../lib/stores/data.js';
  import { toast } from '../lib/toast.js';
  import { onDestroy } from 'svelte';

  let running = $state(false);
  let elapsed = $state(0);
  let startedAt = null;
  let timer;
  let distance = $state('');

  function fmtTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function toggle() {
    if (running) {
      clearInterval(timer);
      running = false;
    } else {
      startedAt = startedAt || new Date();
      running = true;
      timer = setInterval(() => (elapsed = (Date.now() - startedAt.getTime()) / 1000), 250);
    }
  }

  function reset() {
    clearInterval(timer);
    running = false;
    elapsed = 0;
    startedAt = null;
    distance = '';
  }

  const km = $derived(+distance || 0);
  const paceSec = $derived(km > 0 ? elapsed / km : 0);
  const pace = $derived(km > 0 ? fmtTime(paceSec) : '--:--');
  const steps = $derived(Math.round(km * 1350));
  const calories = $derived(Math.round(km * 62));

  async function save() {
    if (!km || elapsed < 5) { toast('Need time and distance', false); return; }
    const end = new Date();
    const err = await addRun({
      start: startedAt.toISOString(), end: end.toISOString(),
      duration_sec: Math.round(elapsed), distance_km: km,
      pace: Math.round(paceSec), steps, calories, path: null
    });
    if (err) { toast('Save failed', false); return; }
    toast(`Logged ${km} km run`);
    reset();
  }

  onDestroy(() => clearInterval(timer));

  const recent = $derived($runLog.slice(0, 5));
  const weekKm = $derived(
    $runLog.filter((r) => {
      const d = new Date(r.date);
      return (Date.now() - d.getTime()) / 864e5 < 7;
    }).reduce((a, r) => a + (r.distance_km || 0), 0)
  );
</script>

<header class="flex items-center gap-2.5 mb-3 px-1">
  <h1 class="text-2xl font-extrabold tracking-tight">Run</h1>
  <span class="ml-auto tnum text-(--color-ink-dim) text-sm">{weekKm.toFixed(1)} km this week</span>
</header>

<Glass class="mb-3 flex flex-col items-center py-6">
  <Ring value={Math.round(elapsed)} max={Math.max(elapsed, 1800)} size={150} stroke={13}
        color="var(--color-sky)" label="" />
  <div class="num text-4xl mt-3" style="color:var(--color-sky)">{fmtTime(elapsed)}</div>
  <div class="text-[11px] text-(--color-ink-dim) font-medium mt-1">elapsed time</div>

  <div class="flex gap-3 mt-5">
    <button onclick={toggle} class="px-7 py-3 rounded-2xl text-sm font-semibold"
      style="background:linear-gradient(145deg,#9be0ff,#4fb8ff);color:#04223a">
      {running ? 'Pause' : elapsed ? 'Resume' : 'Start'}
    </button>
    <button onclick={reset} class="px-5 py-3 rounded-2xl text-sm font-medium text-(--color-ink-dim)" style="background:rgba(255,255,255,.08)">Reset</button>
  </div>
</Glass>

<Glass class="mb-3">
  <label class="flex flex-col gap-1 mb-3">
    <span class="text-[11px] text-(--color-ink-dim)">Distance (km)</span>
    <input bind:value={distance} type="number" inputmode="decimal" step="0.01" placeholder="5.00"
      class="bg-transparent outline-none rounded-xl px-3 py-2.5 text-sm tnum" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)" />
  </label>
  <div class="grid grid-cols-3 gap-2.5 mb-3">
    <div class="text-center"><div class="num text-lg">{pace}</div><div class="text-[10px] text-(--color-ink-dim)">pace /km</div></div>
    <div class="text-center"><div class="num text-lg">{calories}</div><div class="text-[10px] text-(--color-ink-dim)">kcal</div></div>
    <div class="text-center"><div class="num text-lg">{steps.toLocaleString()}</div><div class="text-[10px] text-(--color-ink-dim)">steps</div></div>
  </div>
  <button onclick={save} class="w-full py-3 rounded-2xl text-sm font-semibold" style="background:linear-gradient(145deg,#d6ff3a,#9ee000);color:#0a2000">Save run</button>
</Glass>

<div class="text-[11px] font-semibold tracking-wide text-(--color-ink-dim) mb-2 px-1">RECENT RUNS</div>
<Glass padding="p-1.5">
  {#if recent.length === 0}
    <p class="text-sm text-(--color-ink-faint) py-6 text-center">No runs logged yet.</p>
  {:else}
    {#each recent as r, i}
      {#if i > 0}<div class="h-px mx-3" style="background:rgba(255,255,255,.08)"></div>{/if}
      <div class="flex items-center gap-3 px-2.5 py-2.5">
        <Icon name="run" size={18} color="var(--color-sky)" />
        <div class="flex-1">
          <div class="text-sm tnum font-semibold">{(r.distance_km || 0).toFixed(2)} km</div>
          <div class="text-[11px] text-(--color-ink-dim)">{r.date} · {r.date === today() ? 'today' : r.day}</div>
        </div>
        <span class="tnum text-sm text-(--color-ink-dim)">{fmtTime(r.duration_sec || 0)}</span>
      </div>
    {/each}
  {/if}
</Glass>
