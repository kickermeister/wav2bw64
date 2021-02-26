import { writable } from 'svelte/store';

export const ADMStore = writable([
  {
    name: "Audio Programme 1",
    loudness: -23,
    items: [],
    language: 'Deutsch'
  },
  {
    name: "Audio Programme 2",
    loudness: -23,
    items: [],
    language: 'Deutsch'
  },
]);