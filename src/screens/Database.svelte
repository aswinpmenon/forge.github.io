<script>
  import Glass from '../lib/components/Glass.svelte';
  import Icon from '../lib/components/Icon.svelte';
  import { go } from '../lib/stores/router.js';
  import { calLog, workoutLog, runLog, bodyStats, exportJson, exportCsv, clearAll } from '../lib/stores/data.js';
  import { toast } from '../lib/toast.js';

  let confirming = $state(false);

  const tables = $derived([
    { key: 'calorie_log', label: 'Calorie log', icon: 'flame', count: $calLog.length },
    { key: 'workout_log', label: 'Workout log', icon: 'dumbbell', count: $workoutLog.length },
    { key: 'run_log', label: 'Run log', icon: 'run', count: $runLog.length },
    { key: 'body_stats', label: 'Body stats', icon: 'user', count: $bodyStats.length }
  ]);

  async function wipe() {
    await clearAll();
    confirming = false;
    toast('All training data cleared');
  }
</script>

<header class="flex items-center gap-2.5 mb-3 px-1">
  <button onclick={() => go('about')} aria-label="Back"><Icon name="chevronLeft" size={22} color="var(--color-ink-dim)" /></button>
  <h1 class="text-2xl font-extrabold tracking-tight">Database</h1>
</header>

<Glass padding="p-1.5" class="mb-3">
  {#each tables as t, i}
    {#if i > 0}<div class="h-px mx-3" style="background:rgba(255,255,255,.08)"></div>{/if}
    <div class="flex items-center gap-3 px-2.5 py-3">
      <span class="w-9 h-9 rounded-xl grid place-items-center" style="background:rgba(255,255,255,.08);color:var(--color-lime)"><Icon name={t.icon} size={18} /></span>
      <div class="flex-1">
        <div class="text-sm">{t.label}</div>
        <div class="text-[11px] text-(--color-ink-dim) tnum">{t.count} {t.count === 1 ? 'row' : 'rows'}</div>
      </div>
      <button onclick={() => exportCsv(t.key)} disabled={!t.count}
        class="px-3 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1.5"
        style="background:rgba(255,255,255,.1);color:{t.count ? 'var(--color-ink)' : 'var(--color-ink-faint)'}">
        <Icon name="arrowUpRight" size={13} /> CSV
      </button>
    </div>
  {/each}
</Glass>

<button onclick={exportJson} class="w-full glass py-3.5 mb-3 flex items-center justify-center gap-2 text-sm font-semibold">
  <Icon name="arrowUpRight" size={17} color="var(--color-lime)" /> Export everything (JSON)
</button>

<div class="text-[11px] font-semibold tracking-wide mb-2 px-1" style="color:var(--color-danger)">DANGER ZONE</div>
<Glass style="border-color:rgba(255,84,104,.3)">
  {#if !confirming}
    <button onclick={() => (confirming = true)} class="w-full py-2.5 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
      style="background:rgba(255,84,104,.12);color:var(--color-danger)">
      <Icon name="trash" size={16} /> Clear all training data
    </button>
  {:else}
    <p class="text-sm text-(--color-ink-dim) mb-3">This permanently deletes calorie, workout and run logs. Export first if unsure.</p>
    <div class="flex gap-2.5">
      <button onclick={() => (confirming = false)} class="flex-1 py-2.5 rounded-2xl text-sm font-medium" style="background:rgba(255,255,255,.08)">Cancel</button>
      <button onclick={wipe} class="flex-1 py-2.5 rounded-2xl text-sm font-semibold" style="background:var(--color-danger);color:#2a0008">Delete forever</button>
    </div>
  {/if}
</Glass>
