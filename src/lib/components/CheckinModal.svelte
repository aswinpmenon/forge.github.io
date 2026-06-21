<script>
  import Glass from './Glass.svelte';
  import Icon from './Icon.svelte';
  import { doCheckin } from '../stores/data.js';
  import { toast } from '../toast.js';

  let { onclose } = $props();
  let sleep = $state(7);
  let busy = $state(false);

  async function start() {
    busy = true;
    const res = await doCheckin(sleep);
    toast(`Day started · ${res.streak}d streak 🔥`.replace(' 🔥', ''));
    busy = false;
    onclose?.();
  }
</script>

<div class="fixed inset-0 z-50 grid place-items-center px-6" style="background:rgba(0,0,0,.55);backdrop-filter:blur(6px)">
  <Glass strong padding="p-6" class="w-full max-w-sm text-center">
    <div class="w-12 h-12 rounded-full grid place-items-center mx-auto mb-3" style="background:rgba(200,255,0,.14);color:var(--color-lime)">
      <Icon name="flame" size={24} />
    </div>
    <h2 class="text-2xl font-extrabold tracking-tight mb-1">Morning check-in</h2>
    <p class="text-sm text-(--color-ink-dim) mb-5">How many hours did you sleep?</p>

    <div class="num text-5xl mb-1" style="color:var(--color-lime)">{sleep.toFixed(1)}</div>
    <div class="text-[11px] text-(--color-ink-dim) font-medium mb-4">HOURS</div>

    <input type="range" min="4" max="10" step="0.5" bind:value={sleep}
      class="w-full mb-6 accent-lime-400" style="accent-color:var(--color-lime)" />

    <button onclick={start} disabled={busy}
      class="w-full py-3.5 rounded-2xl text-sm font-semibold active:scale-[.98] transition"
      style="background:linear-gradient(145deg,#d6ff3a,#9ee000);color:#0a2000">
      {busy ? 'Starting…' : 'Start day'}
    </button>
    <button onclick={() => onclose?.()} class="w-full py-2.5 mt-2 text-sm text-(--color-ink-dim)">Skip for now</button>
  </Glass>
</div>
