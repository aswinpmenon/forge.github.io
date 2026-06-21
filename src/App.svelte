<script>
  import AnimatedBg from './lib/components/AnimatedBg.svelte';
  import BottomNav from './lib/components/BottomNav.svelte';
  import Toast from './lib/components/Toast.svelte';
  import Login from './screens/Login.svelte';
  import Dashboard from './screens/Dashboard.svelte';
  import Food from './screens/Food.svelte';
  import Workout from './screens/Workout.svelte';
  import Run from './screens/Run.svelte';
  import Social from './screens/Social.svelte';
  import Progress from './screens/Progress.svelte';
  import Database from './screens/Database.svelte';
  import About from './screens/About.svelte';
  import CheckinModal from './lib/components/CheckinModal.svelte';

  import { user, authReady } from './lib/stores/auth.js';
  import { screen } from './lib/stores/router.js';
  import { loadAll, loading, routineDone } from './lib/stores/data.js';
  import { showCheckin, checkinAutoShown } from './lib/stores/ui.js';

  let loadedFor = null;
  $effect(() => {
    if ($user && $user.id !== loadedFor) {
      loadedFor = $user.id;
      loadAll();
    }
    if (!$user) loadedFor = null;
  });

  // Auto-prompt the morning check-in once per session if not done today
  $effect(() => {
    if ($user && !$loading && !$checkinAutoShown && !$routineDone.includes(1)) {
      checkinAutoShown.set(true);
      showCheckin.set(true);
    }
  });

  const views = {
    dashboard: Dashboard, food: Food, workout: Workout, run: Run,
    social: Social, progress: Progress, database: Database, about: About
  };
  const Current = $derived(views[$screen] ?? Dashboard);
</script>

<AnimatedBg />

{#if !$authReady}
  <div class="min-h-screen grid place-items-center">
    <img src="/forgewhitee.png" alt="FORGE" class="w-16 opacity-80 animate-pulse" />
  </div>
{:else if !$user}
  <Login />
{:else}
  <main class="mx-auto w-full px-4 pt-3 pb-28" style="max-width:430px">
    <Current />
  </main>
  <BottomNav />
  {#if $showCheckin}
    <CheckinModal onclose={() => showCheckin.set(false)} />
  {/if}
{/if}

<Toast />
