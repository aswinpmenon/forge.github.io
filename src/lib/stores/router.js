import { writable } from 'svelte/store';

export const SCREENS = ['dashboard', 'food', 'workout', 'run', 'social'];

export const screen = writable('dashboard');

export function go(name) {
  screen.set(name);
  if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
}
