<script>
  let {
    data = [],
    color = 'var(--color-lime)',
    goal = null,
    height = 130,
    labels = []
  } = $props();

  const max = $derived(Math.max(...data, goal || 0, 1));
</script>

<div class="flex items-end gap-1.5" style="height:{height}px">
  {#each data as v, i}
    <div class="flex-1 flex flex-col justify-end h-full relative">
      {#if goal}
        <div class="absolute left-0 right-0" style="bottom:{(goal / max) * 100}%;border-top:1px dashed rgba(255,255,255,.25)"></div>
      {/if}
      <div class="rounded-t-md w-full transition-all"
        style="height:{Math.max(2, (v / max) * 100)}%;background:{v >= (goal || 0) && goal ? color : 'rgba(255,255,255,.18)'}"></div>
    </div>
  {/each}
</div>
{#if labels.length}
  <div class="flex gap-1.5 mt-1.5">
    {#each labels as l}<span class="flex-1 text-center text-[10px] text-(--color-ink-faint)">{l}</span>{/each}
  </div>
{/if}
