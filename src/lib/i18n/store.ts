/**
 * Locale store + `t()` helper. No i18n library.
 *
 * The active locale is resolved before first paint by a tiny inline script in
 * app.html (see there), which sets `<html lang>` / `data-locale` and a global.
 * This module seeds its initial value from that global so the first hydrated
 * render already matches the user's locale — no language flash.
 */

import { derived, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { dict, type Locale, type MessageKey } from './dict.ts';

const STORAGE_KEY = 'locale';

function initialLocale(): Locale {
  if (browser) {
    const fromHtml = document.documentElement.dataset.locale;
    if (fromHtml === 'ko' || fromHtml === 'en') return fromHtml;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ko' || stored === 'en') return stored;
    return navigator.language.startsWith('ko') ? 'ko' : 'en';
  }
  // Server prerender default. The café is in Korea, so Korean is the safer
  // default for the static HTML before the client resolves the real locale.
  return 'ko';
}

export const locale = writable<Locale>(initialLocale());

/** Persist explicit choices and keep <html lang>/data-locale in sync. */
if (browser) {
  locale.subscribe((value) => {
    document.documentElement.lang = value;
    document.documentElement.dataset.locale = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* storage may be unavailable; ignore */
    }
  });
}

export function setLocale(value: Locale): void {
  locale.set(value);
}

export function toggleLocale(): void {
  locale.update((l) => (l === 'ko' ? 'en' : 'ko'));
}

/** Reactive translator: `$t('nav.library')`. */
export const t = derived(
  locale,
  ($locale) =>
    (key: MessageKey): string =>
      dict[key][$locale]
);
