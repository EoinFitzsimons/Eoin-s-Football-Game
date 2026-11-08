/**
 * Player-facing settings, persisted in localStorage.
 * Everything here is optional: the game runs with the defaults if storage is
 * unavailable (for example in a private browsing window that blocks it).
 */

const STORAGE_KEY = 'efg_settings';

export const DEFAULT_SETTINGS = Object.freeze({
  soundEnabled: true,
  halfLengthMinutes: 2,      // real minutes per half in the playable match (2 or 3)
  difficulty: 'normal',      // 'easy' | 'normal' | 'hard'
  autoSave: true
});

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.warn('Settings could not be read, using defaults', error);
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Settings could not be saved', error);
  }
}

export function updateSettings(patch) {
  const next = { ...loadSettings(), ...patch };
  saveSettings(next);
  return next;
}
