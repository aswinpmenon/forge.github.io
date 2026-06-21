<script>
  import Glass from '../lib/components/Glass.svelte';
  import Icon from '../lib/components/Icon.svelte';
  import {
    leaderboard, incoming, socialLoading, loadSocial, sendRequest, acceptRequest
  } from '../lib/stores/social.js';
  import { toast } from '../lib/toast.js';
  import { onMount } from 'svelte';

  let email = $state('');
  let sending = $state(false);

  onMount(loadSocial);

  async function add() {
    if (!email.trim()) return;
    sending = true;
    const err = await sendRequest(email);
    sending = false;
    if (err) { toast(err, false); return; }
    toast('Request sent');
    email = '';
  }

  const medal = (rank) => (rank === 1 ? '#ffd24a' : rank === 2 ? '#cfd6e0' : rank === 3 ? '#d8915a' : null);
  const nameOf = (e) => (e || '?').split('@')[0];
</script>

<header class="flex items-center gap-2.5 mb-3 px-1">
  <h1 class="text-2xl font-extrabold tracking-tight">Social</h1>
  <Icon name="trophy" size={22} color="var(--color-lime)" class="ml-auto" />
</header>

{#if $incoming.length}
  <Glass class="mb-3">
    <div class="text-[11px] font-semibold tracking-wide text-(--color-ink-dim) mb-2.5">FRIEND REQUESTS</div>
    <div class="flex flex-col gap-2.5">
      {#each $incoming as req}
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-full grid place-items-center text-xs font-semibold" style="background:rgba(255,255,255,.1);color:var(--color-lime)">{nameOf(req.email).slice(0,2).toUpperCase()}</div>
          <span class="flex-1 text-sm truncate">{nameOf(req.email)}</span>
          <button onclick={() => acceptRequest(req.id, req.sender_id)} class="px-3.5 py-1.5 rounded-full text-[13px] font-semibold" style="background:linear-gradient(145deg,#d6ff3a,#9ee000);color:#0a2000">Accept</button>
        </div>
      {/each}
    </div>
  </Glass>
{/if}

<Glass class="mb-3 flex items-center gap-2.5">
  <Icon name="user" size={18} color="var(--color-ink-dim)" />
  <input bind:value={email} type="email" placeholder="Add friend by email…"
    class="flex-1 bg-transparent outline-none text-sm placeholder:text-(--color-ink-faint)" />
  <button onclick={add} disabled={sending} aria-label="Send request"
    class="w-9 h-9 rounded-full grid place-items-center" style="color:#0a2000;background:linear-gradient(145deg,#d6ff3a,#9ee000)">
    <Icon name="plus" size={18} />
  </button>
</Glass>

<div class="text-[11px] font-semibold tracking-wide text-(--color-ink-dim) mb-2 px-1">LEADERBOARD</div>
<Glass padding="p-1.5">
  {#if $socialLoading}
    <p class="text-sm text-(--color-ink-faint) py-6 text-center">Loading…</p>
  {:else if $leaderboard.length === 0}
    <p class="text-sm text-(--color-ink-faint) py-6 text-center">Add friends to compete.</p>
  {:else}
    {#each $leaderboard as p, i}
      {#if i > 0}<div class="h-px mx-3" style="background:rgba(255,255,255,.08)"></div>{/if}
      <div class="flex items-center gap-3 px-2.5 py-2.5 rounded-2xl"
           style="{p.isMe ? 'background:rgba(200,255,0,.08)' : ''}">
        <span class="num text-sm w-6 text-center" style="color:{medal(p.rank) || 'var(--color-ink-dim)'}">{p.rank}</span>
        <div class="w-9 h-9 rounded-full grid place-items-center text-xs font-semibold" style="background:rgba(255,255,255,.1);color:var(--color-lime)">{nameOf(p.email).slice(0,2).toUpperCase()}</div>
        <div class="flex-1 min-w-0">
          <div class="text-sm truncate">{nameOf(p.email)}{p.isMe ? ' (you)' : ''}</div>
          <div class="text-[11px] text-(--color-ink-dim)">Lvl {p.level} · {p.streak}d streak</div>
        </div>
        <span class="num text-sm" style="color:var(--color-lime)">{(p.xp || 0).toLocaleString()} XP</span>
      </div>
    {/each}
  {/if}
</Glass>
