<script>
  import Glass from '../lib/components/Glass.svelte';
  import Icon from '../lib/components/Icon.svelte';
  import { signInWithGoogle } from '../lib/stores/auth.js';
  import { toast } from '../lib/toast.js';

  let busy = $state(false);
  async function login() {
    busy = true;
    const err = await signInWithGoogle();
    if (err) {
      toast('Login failed', false);
      busy = false;
    }
  }
</script>

<div class="min-h-screen grid place-items-center px-6">
  <div class="w-full max-w-sm text-center">
    <img src="/forgewhitee.png" alt="FORGE" class="w-20 mx-auto mb-5" />
    <h1 class="text-5xl font-extrabold tracking-tight">FORGE</h1>
    <p class="text-(--color-ink-dim) mt-2 mb-8">Fitness data, forged daily.</p>

    <Glass padding="p-2">
      <button onclick={login} disabled={busy}
        class="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-[15px] transition active:scale-[.98]"
        style="background:linear-gradient(145deg,#d6ff3a,#9ee000);color:#0a2000">
        <Icon name="google" size={20} stroke={2.2} />
        {busy ? 'Connecting…' : 'Continue with Google'}
      </button>
    </Glass>

    <p class="text-xs text-(--color-ink-faint) mt-6">
      Your data is private and synced securely with Supabase.
    </p>
  </div>
</div>
