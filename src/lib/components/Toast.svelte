<script>
  import { toastMsg } from '../toast.js';
</script>

{#if $toastMsg}
  <div class="fixed left-1/2 -translate-x-1/2 bottom-28 z-50 glass-strong px-4 py-2.5 flex items-center gap-2 text-sm"
       style="border-color:{$toastMsg.ok ? 'rgba(200,255,0,.4)' : 'rgba(255,84,104,.5)'}">
    <span class="text-lg" style="color:{$toastMsg.ok ? 'var(--color-lime)' : 'var(--color-danger)'}">
      {$toastMsg.ok ? '✓' : '!'}
    </span>
    <span>{$toastMsg.message}</span>
  </div>
{/if}
