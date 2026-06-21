<script>
  import Glass from '../lib/components/Glass.svelte';
  import Ring from '../lib/components/Ring.svelte';
  import Icon from '../lib/components/Icon.svelte';
  import { user } from '../lib/stores/auth.js';
  import { go } from '../lib/stores/router.js';
  import {
    goal, todayTotals, todayFood, userStats, workoutLog, runLog,
    routineDone, completeBlock, today
  } from '../lib/stores/data.js';
  import { showCheckin } from '../lib/stores/ui.js';

  function handleBlock(b) {
    if ($routineDone.includes(b.id)) return;
    if (b.type === 'checkin') showCheckin.set(true);
    else completeBlock(b.id, b.type);
  }

  const firstName = $derived(
    ($user?.user_metadata?.full_name || $user?.email || 'Athlete').split(/[ @]/)[0]
  );
  const initials = $derived(firstName.slice(0, 2).toUpperCase());

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const macros = $derived([
    { k: 'Protein', v: $todayTotals.protein, max: 180, c: 'var(--color-lime)' },
    { k: 'Carbs', v: $todayTotals.carbs, max: 300, c: 'var(--color-mint)' },
    { k: 'Fat', v: $todayTotals.fat, max: 90, c: 'var(--color-sky)' }
  ]);

  const todayWorkoutSets = $derived($workoutLog.filter((r) => r.date === today()).length);
  const todayRunKm = $derived(
    $runLog.filter((r) => r.date === today()).reduce((a, r) => a + (r.distance_km || 0), 0)
  );

  // Demo routine blocks (block ids stable for routine_log)
  const blocks = [
    { id: 1, label: 'Morning check-in', type: 'checkin' },
    { id: 2, label: 'Strength session', type: 'gym' },
    { id: 3, label: 'Zone-2 cardio', type: 'run' },
    { id: 4, label: 'Evening weigh-in', type: 'weight' }
  ];
  const doneCount = $derived(blocks.filter((b) => $routineDone.includes(b.id)).length);
</script>

<header class="flex items-center justify-between mb-3 px-1">
  <div>
    <div class="text-[11px] text-(--color-ink-dim) font-medium">{greeting}</div>
    <h1 class="text-[28px] font-extrabold tracking-tight leading-none">{firstName}</h1>
  </div>
  <div class="flex items-center gap-2.5">
    <button onclick={() => go('progress')} aria-label="Progress"
      class="w-10 h-10 rounded-full grid place-items-center"
      style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:var(--color-ink-dim)">
      <Icon name="bolt" size={18} />
    </button>
    <button onclick={() => go('about')} aria-label="Account"
      class="w-10 h-10 rounded-full grid place-items-center font-semibold text-(--color-lime)"
      style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18)">
      {initials}
    </button>
  </div>
</header>

<!-- Calorie + macros -->
<Glass class="mb-3 flex gap-4 items-center">
  <Ring value={$todayTotals.kcal} max={$goal} label={`of ${$goal.toLocaleString()} kcal`} />
  <div class="flex-1 flex flex-col gap-2.5">
    {#each macros as m}
      <div>
        <div class="flex justify-between text-[11px] mb-1">
          <span class="text-(--color-ink-dim)">{m.k}</span>
          <span class="tnum font-semibold">{m.v}g</span>
        </div>
        <div class="h-1.5 rounded-full overflow-hidden" style="background:rgba(255,255,255,.12)">
          <div class="h-full rounded-full" style="width:{Math.min(100, (m.v / m.max) * 100)}%;background:{m.c}"></div>
        </div>
      </div>
    {/each}
  </div>
</Glass>

<!-- Quick stats -->
<div class="grid grid-cols-3 gap-2.5 mb-3">
  <Glass padding="p-3">
    <div class="text-[11px] text-(--color-ink-dim) font-medium">Streak</div>
    <div class="num text-[22px] mt-0.5">{$userStats?.streak ?? 0}<span class="text-xs text-(--color-ink-faint) font-medium"> d</span></div>
    <div class="text-[11px] mt-0.5 font-medium" style="color:var(--color-lime)">
      <Icon name="flame" size={12} class="inline -mt-0.5" /> Level {$userStats?.level ?? 1}
    </div>
  </Glass>
  <Glass padding="p-3">
    <div class="text-[11px] text-(--color-ink-dim) font-medium">Sets today</div>
    <div class="num text-[22px] mt-0.5">{todayWorkoutSets}</div>
    <button onclick={() => go('workout')} class="text-[11px] mt-0.5 font-medium" style="color:var(--color-mint)">Log gym →</button>
  </Glass>
  <Glass padding="p-3">
    <div class="text-[11px] text-(--color-ink-dim) font-medium">Run</div>
    <div class="num text-[22px] mt-0.5">{todayRunKm.toFixed(1)}<span class="text-xs text-(--color-ink-faint) font-medium"> km</span></div>
    <button onclick={() => go('run')} class="text-[11px] mt-0.5 font-medium" style="color:var(--color-sky)">Track →</button>
  </Glass>
</div>

<!-- Routine -->
<Glass class="mb-3">
  <div class="flex justify-between items-center mb-3">
    <span class="text-lg font-bold">Today's routine</span>
    <span class="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1"
          style="background:rgba(255,255,255,.1);color:var(--color-lime)">
      <Icon name="bolt" size={13} /> {doneCount} / {blocks.length}
    </span>
  </div>
  <div class="flex flex-col gap-2.5">
    {#each blocks as b}
      {@const done = $routineDone.includes(b.id)}
      <button onclick={() => handleBlock(b)}
        class="flex items-center gap-2.5 text-[13px] text-left transition"
        style="color:{done ? 'var(--color-ink-dim)' : 'var(--color-ink)'}">
        <Icon name={done ? 'checkCircle' : 'circle'} size={18}
              color={done ? 'var(--color-lime)' : 'rgba(255,255,255,.3)'} />
        <span style="text-decoration:{done ? 'line-through' : 'none'}">{b.label}</span>
      </button>
    {/each}
  </div>
</Glass>

<!-- Recent meals -->
<Glass>
  <div class="flex justify-between items-center mb-3">
    <span class="text-lg font-bold">Today's food</span>
    <button onclick={() => go('food')} class="text-xs font-medium" style="color:var(--color-lime)">Add →</button>
  </div>
  {#if $todayFood.length === 0}
    <p class="text-sm text-(--color-ink-faint) py-3 text-center">No meals logged yet today.</p>
  {:else}
    <div class="flex flex-col gap-2">
      {#each $todayFood.slice(0, 4) as r}
        <div class="flex items-center justify-between text-sm">
          <span class="text-(--color-ink-dim)">{r.course}</span>
          <span class="tnum font-semibold">{r.calories_kcal} kcal</span>
        </div>
      {/each}
    </div>
  {/if}
</Glass>
