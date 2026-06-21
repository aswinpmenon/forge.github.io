<script>
  import { screen, go } from '../stores/router.js';
  import Icon from './Icon.svelte';

  const items = [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'food', label: 'Cals', icon: 'flame' },
    { id: 'workout', label: 'Gym', icon: 'dumbbell' },
    { id: 'social', label: 'Social', icon: 'trophy' }
  ];
</script>

<nav class="fixed left-3 right-3 bottom-3 z-40 glass flex items-center justify-around px-2 py-2.5 mx-auto"
     style="max-width:430px;padding-bottom:max(10px,env(safe-area-inset-bottom))">
  {#each items.slice(0, 2) as it}
    <button onclick={() => go(it.id)} class="flex flex-col items-center gap-0.5 px-3"
            style="color:{$screen === it.id ? 'var(--color-lime)' : 'var(--color-ink-dim)'}">
      <Icon name={it.icon} size={21} />
      <span class="text-[10px] font-medium">{it.label}</span>
    </button>
  {/each}

  <button onclick={() => go('food')} aria-label="Quick add"
          class="grid place-items-center rounded-full -mt-1"
          style="width:44px;height:44px;color:#0a2000;background:linear-gradient(145deg,#d6ff3a,#9ee000);box-shadow:0 6px 16px rgba(184,255,0,.4),inset 0 1px 0 rgba(255,255,255,.6)">
    <Icon name="plus" size={24} stroke={2.4} />
  </button>

  {#each items.slice(2) as it}
    <button onclick={() => go(it.id)} class="flex flex-col items-center gap-0.5 px-3"
            style="color:{$screen === it.id ? 'var(--color-lime)' : 'var(--color-ink-dim)'}">
      <Icon name={it.icon} size={21} />
      <span class="text-[10px] font-medium">{it.label}</span>
    </button>
  {/each}
</nav>
