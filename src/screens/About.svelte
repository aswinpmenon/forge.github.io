<script>
  import Glass from '../lib/components/Glass.svelte';
  import Icon from '../lib/components/Icon.svelte';
  import { go } from '../lib/stores/router.js';
  import { user, signOut } from '../lib/stores/auth.js';
  import { goal, setGoal, userStats } from '../lib/stores/data.js';
  import { toast } from '../lib/toast.js';

  const name = $derived($user?.user_metadata?.full_name || $user?.email?.split('@')[0] || 'Athlete');
  const initials = $derived(name.slice(0, 2).toUpperCase());

  let goalInput = $state(String($goal));
  $effect(() => { goalInput = String($goal); });

  async function saveGoal() {
    const v = parseInt(goalInput, 10);
    if (!v || v < 500) { toast('Enter a valid goal', false); return; }
    await setGoal(v);
    toast('Goal updated');
  }
</script>

<header class="flex items-center gap-2.5 mb-3 px-1">
  <button onclick={() => go('dashboard')} aria-label="Back"><Icon name="chevronLeft" size={22} color="var(--color-ink-dim)" /></button>
  <h1 class="text-2xl font-extrabold tracking-tight">Account</h1>
</header>

<Glass class="mb-3 flex items-center gap-3.5">
  <div class="w-14 h-14 rounded-full grid place-items-center text-lg font-semibold" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);color:var(--color-lime)">{initials}</div>
  <div class="min-w-0">
    <div class="text-lg font-bold truncate">{name}</div>
    <div class="text-sm text-(--color-ink-dim) truncate">{$user?.email ?? ''}</div>
    <div class="text-[11px] mt-0.5" style="color:var(--color-lime)">Level {$userStats?.level ?? 1} · {$userStats?.xp ?? 0} XP · {$userStats?.streak ?? 0}d streak</div>
  </div>
</Glass>

<Glass class="mb-3">
  <div class="text-[11px] font-semibold tracking-wide text-(--color-ink-dim) mb-2.5">DAILY CALORIE GOAL</div>
  <div class="flex gap-2.5">
    <input bind:value={goalInput} type="number" inputmode="numeric"
      class="flex-1 bg-transparent outline-none rounded-xl px-3 py-2.5 text-sm tnum" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)" />
    <button onclick={saveGoal} class="px-5 rounded-xl text-sm font-semibold" style="background:linear-gradient(145deg,#d6ff3a,#9ee000);color:#0a2000">Save</button>
  </div>
</Glass>

<Glass padding="p-1.5" class="mb-3">
  <button onclick={() => go('progress')} class="w-full flex items-center gap-3 px-2.5 py-3">
    <span class="w-9 h-9 rounded-xl grid place-items-center" style="background:rgba(255,255,255,.08);color:var(--color-lime)"><Icon name="bolt" size={18} /></span>
    <span class="flex-1 text-left text-sm">Progress &amp; charts</span>
    <Icon name="chevronRight" size={18} color="var(--color-ink-faint)" />
  </button>
  <div class="h-px mx-3" style="background:rgba(255,255,255,.08)"></div>
  <button onclick={() => go('database')} class="w-full flex items-center gap-3 px-2.5 py-3">
    <span class="w-9 h-9 rounded-xl grid place-items-center" style="background:rgba(255,255,255,.08);color:var(--color-mint)"><Icon name="arrowUpRight" size={18} /></span>
    <span class="flex-1 text-left text-sm">Data &amp; export</span>
    <Icon name="chevronRight" size={18} color="var(--color-ink-faint)" />
  </button>
</Glass>

<button onclick={signOut} class="w-full glass py-3.5 mb-3 flex items-center justify-center gap-2 text-sm font-semibold" style="color:var(--color-danger)">
  <Icon name="logout" size={17} /> Sign out
</button>

<p class="text-center text-xs text-(--color-ink-faint)">FORGE · v5.0 · Fitness data, forged daily.</p>
