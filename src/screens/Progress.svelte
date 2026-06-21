<script>
  import Glass from '../lib/components/Glass.svelte';
  import Icon from '../lib/components/Icon.svelte';
  import LineChart from '../lib/components/LineChart.svelte';
  import BarChart from '../lib/components/BarChart.svelte';
  import { go } from '../lib/stores/router.js';
  import { calLog, workoutLog, runLog, bodyStats, goal } from '../lib/stores/data.js';

  function lastDays(n) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push(d);
    }
    return out;
  }
  const iso = (d) => d.toISOString().split('T')[0];
  const dow = (d) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];

  const week = lastDays(7);
  const weekLabels = week.map(dow);

  const calByDay = $derived(
    week.map((d) => $calLog.filter((r) => r.date === iso(d)).reduce((a, r) => a + (r.calories_kcal || 0), 0))
  );
  const avgCal = $derived(Math.round(calByDay.reduce((a, b) => a + b, 0) / 7));

  const volByDay = $derived(
    week.map((d) => $workoutLog.filter((r) => r.date === iso(d)).reduce((a, r) => a + (r.weight_lbs || 0) * (r.reps || 0), 0))
  );
  const weekVol = $derived(volByDay.reduce((a, b) => a + b, 0));

  const runByDay = $derived(
    week.map((d) => $runLog.filter((r) => r.date === iso(d)).reduce((a, r) => a + (r.distance_km || 0), 0))
  );
  const weekKm = $derived(runByDay.reduce((a, b) => a + b, 0));

  const weights = $derived([...$bodyStats].reverse().slice(-10));
  const weightVals = $derived(weights.map((b) => b.weight_kg));
  const latestWeight = $derived(weightVals.at(-1) ?? null);
  const weightDelta = $derived(
    weightVals.length > 1 ? +(weightVals.at(-1) - weightVals[0]).toFixed(1) : 0
  );
</script>

<header class="flex items-center gap-2.5 mb-3 px-1">
  <button onclick={() => go('dashboard')} aria-label="Back"><Icon name="chevronLeft" size={22} color="var(--color-ink-dim)" /></button>
  <h1 class="text-2xl font-extrabold tracking-tight">Progress</h1>
</header>

<!-- Calories -->
<Glass class="mb-3">
  <div class="flex justify-between items-baseline mb-3">
    <span class="text-lg font-bold">Calories</span>
    <span class="text-sm text-(--color-ink-dim)">avg <span class="tnum font-semibold text-(--color-ink)">{avgCal.toLocaleString()}</span> · goal {$goal.toLocaleString()}</span>
  </div>
  <BarChart data={calByDay} goal={$goal} labels={weekLabels} color="var(--color-lime)" />
</Glass>

<!-- Weight -->
<Glass class="mb-3">
  <div class="flex justify-between items-baseline mb-3">
    <span class="text-lg font-bold">Body weight</span>
    {#if latestWeight}
      <span class="text-sm">
        <span class="tnum font-semibold">{latestWeight} kg</span>
        {#if weightDelta !== 0}
          <span style="color:{weightDelta < 0 ? 'var(--color-mint)' : 'var(--color-sky)'}">
            {weightDelta > 0 ? '+' : ''}{weightDelta}
          </span>
        {/if}
      </span>
    {/if}
  </div>
  {#if weightVals.length > 1}
    <LineChart data={weightVals} color="var(--color-sky)" />
  {:else}
    <p class="text-sm text-(--color-ink-faint) py-6 text-center">Log weekly weigh-ins to see your trend.</p>
  {/if}
</Glass>

<!-- This week summary -->
<div class="grid grid-cols-2 gap-2.5 mb-3">
  <Glass padding="p-3.5">
    <div class="text-[11px] text-(--color-ink-dim) font-medium">Training volume</div>
    <div class="num text-2xl mt-1">{weekVol.toLocaleString()}<span class="text-sm text-(--color-ink-faint) font-medium"> lb</span></div>
    <div class="text-[11px] text-(--color-ink-dim) mt-0.5">this week</div>
  </Glass>
  <Glass padding="p-3.5">
    <div class="text-[11px] text-(--color-ink-dim) font-medium">Distance run</div>
    <div class="num text-2xl mt-1">{weekKm.toFixed(1)}<span class="text-sm text-(--color-ink-faint) font-medium"> km</span></div>
    <div class="text-[11px] text-(--color-ink-dim) mt-0.5">this week</div>
  </Glass>
</div>

<Glass>
  <div class="text-lg font-bold mb-3">Weekly running</div>
  <BarChart data={runByDay} labels={weekLabels} goal={0.1} color="var(--color-sky)" height={90} />
</Glass>
