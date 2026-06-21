import { writable } from 'svelte/store';
import { supabase } from '../supabase.js';

export const user = writable(null);
export const authReady = writable(false);

supabase.auth.getSession().then(({ data }) => {
  user.set(data.session?.user ?? null);
  authReady.set(true);
});

supabase.auth.onAuthStateChange((_event, session) => {
  user.set(session?.user ?? null);
  authReady.set(true);
});

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
  return error;
}

export async function signOut() {
  await supabase.auth.signOut({ scope: 'local' });
  user.set(null);
}
