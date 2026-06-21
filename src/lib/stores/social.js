import { writable, get } from 'svelte/store';
import { supabase } from '../supabase.js';
import { user } from './auth.js';

export const leaderboard = writable([]);
export const incoming = writable([]);
export const socialLoading = writable(false);

function me() {
  return get(user)?.id;
}

export async function loadSocial() {
  const id = me();
  if (!id) return;
  socialLoading.set(true);

  const { data: fr } = await supabase.from('friends').select('friend_id').eq('user_id', id);
  const friendIds = (fr ?? []).map((r) => r.friend_id);
  const ids = [id, ...friendIds];

  const { data: stats } = await supabase
    .from('user_stats')
    .select('user_id, email, xp, level, streak')
    .in('user_id', ids)
    .order('xp', { ascending: false });

  leaderboard.set(
    (stats ?? []).map((s, i) => ({ ...s, rank: i + 1, isMe: s.user_id === id }))
  );

  const { data: reqs } = await supabase
    .from('friend_requests')
    .select('id, sender_id')
    .eq('receiver_id', id)
    .eq('status', 'pending');

  const senderIds = (reqs ?? []).map((r) => r.sender_id);
  let senders = [];
  if (senderIds.length) {
    const { data } = await supabase
      .from('user_stats')
      .select('user_id, email')
      .in('user_id', senderIds);
    senders = data ?? [];
  }
  incoming.set(
    (reqs ?? []).map((r) => ({
      id: r.id,
      sender_id: r.sender_id,
      email: senders.find((s) => s.user_id === r.sender_id)?.email ?? 'Someone'
    }))
  );
  socialLoading.set(false);
}

export async function sendRequest(email) {
  const id = me();
  const { data: target } = await supabase
    .from('user_stats')
    .select('user_id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();
  if (!target) return 'No user with that email';
  if (target.user_id === id) return "That's you!";
  const { error } = await supabase
    .from('friend_requests')
    .insert({ sender_id: id, receiver_id: target.user_id, status: 'pending' });
  return error ? 'Request failed' : null;
}

export async function acceptRequest(reqId, senderId) {
  const id = me();
  await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', reqId);
  await supabase.from('friends').insert([
    { user_id: id, friend_id: senderId },
    { user_id: senderId, friend_id: id }
  ]);
  await loadSocial();
}
