import { writable } from 'svelte/store';

export const toastMsg = writable(null);
let timer;

export function toast(message, ok = true) {
  toastMsg.set({ message, ok });
  clearTimeout(timer);
  timer = setTimeout(() => toastMsg.set(null), 2600);
}
