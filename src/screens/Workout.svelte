<script>
  import Glass from '../lib/components/Glass.svelte';
  import Icon from '../lib/components/Icon.svelte';
  import { addWorkoutSets, workoutLog, today } from '../lib/stores/data.js';
  import { toast } from '../lib/toast.js';

  let exercise = $state('');
  let muscle = $state('');
  let weight = $state('');
  let reps = $state('');
  let sets = $state([]);

  function addSet() {
    if (!exercise.trim() || !weight || !reps) { toast('Fill exercise, weight, reps', false); return; }
    sets = [...sets, {
      exercise: exercise.trim(), muscle_group: muscle.trim(),
      set_no: sets.filter((s) => s.exercise === exercise.trim()).length + 1,
      weight_lbs: +weight, reps: +reps
    }];
    weight = ''; reps = '';
  }

  async function finish() {
    if (!sets.length) { toast('Add some sets first', false); return; }
    const err = await addWorkoutSets(Date.now(), sets);
    if (err) { toast('Save failed', false); return; }
    toast(sets.length + ' sets logged');
    sets = []; exercise = ''; muscle = '';
  }

  const todaySets = $derived($workoutLog.filter((r) => r.date === today()));
  const volume = $derived(
    [...sets, ...todaySets].reduce((a, s) => a + (s.weight_lbs || 0) * (s.reps || 0), 0)
  );
</script>

<header class="flex items-center gap-2.5 mb-3 px-1">
  <h1 class="text-2xl font-extrabold tracking-tight">Gym</h1>
  <span class="ml-auto tnum text-(--color-ink-dim) text-sm">{volume.toLocaleString()} lb vol</span>
</header>

<Glass class="mb-3">
  <div class="grid grid-cols-2 gap-2.5 mb-2.5">
    <input bind:value={exercise} placeholder="Exercise" class="col-span-2 bg-transparent outline-none rounded-xl px-3 py-2.5 text-sm" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)" />
    <input bind:value={muscle} placeholder="Muscle group" class="col-span-2 bg-transparent outline-none rounded-xl px-3 py-2.5 text-sm" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)" />
    <input bind:value={weight} type="number" inputmode="decimal" placeholder="Weight (lb)" class="bg-transparent outline-none rounded-xl px-3 py-2.5 text-sm tnum" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)" />
    <input bind:value={reps} type="number" inputmode="numeric" placeholder="Reps" class="bg-transparent outline-none rounded-xl px-3 py-2.5 text-sm tnum" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)" />
  </div>
  <button onclick={addSet} class="w-full py-2.5 rounded-2xl text-sm font-medium flex items-center justify-center gap-1.5" style="background:rgba(255,255,255,.1)">
    <Icon name="plus" size={16} /> Add set
  </button>
</Glass>

{#if sets.length}
  <Glass class="mb-3">
    <div class="text-[11px] font-semibold tracking-wide text-(--color-ink-dim) mb-2.5">THIS SESSION · {sets.length} SETS</div>
    <div class="flex flex-col gap-2">
      {#each sets as s}
        <div class="flex items-center justify-between text-sm">
          <span>{s.exercise} <span class="text-(--color-ink-faint)">#{s.set_no}</span></span>
          <span class="tnum font-semibold">{s.weight_lbs} lb × {s.reps}</span>
        </div>
      {/each}
    </div>
    <button onclick={finish} class="w-full mt-3 py-3 rounded-2xl text-sm font-semibold" style="background:linear-gradient(145deg,#d6ff3a,#9ee000);color:#0a2000">Finish session</button>
  </Glass>
{/if}

<div class="text-[11px] font-semibold tracking-wide text-(--color-ink-dim) mb-2 px-1">TODAY · {todaySets.length} SETS</div>
<Glass padding="p-1.5">
  {#if todaySets.length === 0}
    <p class="text-sm text-(--color-ink-faint) py-6 text-center">No sets logged today.</p>
  {:else}
    {#each todaySets as r, i}
      {#if i > 0}<div class="h-px mx-3" style="background:rgba(255,255,255,.08)"></div>{/if}
      <div class="flex items-center justify-between px-2.5 py-2.5 text-sm">
        <div>
          <div>{r.exercise}</div>
          <div class="text-[11px] text-(--color-ink-dim)">{r.muscle_group || 'Set ' + r.set_no}</div>
        </div>
        <span class="tnum font-semibold">{r.weight_lbs} lb × {r.reps}</span>
      </div>
    {/each}
  {/if}
</Glass>
