'use client';

const DRAFT_KEY = 'artiva_register_draft';
const EMPTY_DRAFT = {
  username: '',
  email: '',
  display_name: '',
  password: '',
  confirm_password: '',
};

let cachedRaw = null;
let cachedParsed = EMPTY_DRAFT;
const listeners = new Set();

export function subscribeRegisterDraft(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getRegisterDraftSnapshot() {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) {
      cachedRaw = null;
      cachedParsed = EMPTY_DRAFT;
      return EMPTY_DRAFT;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      const parsed = JSON.parse(raw);
      cachedParsed = {
        username: parsed.username || '',
        email: parsed.email || '',
        display_name: parsed.display_name || '',
        password: parsed.password || '',
        confirm_password: parsed.confirm_password || '',
      };
    }
    return cachedParsed;
  } catch {
    return EMPTY_DRAFT;
  }
}

export function getServerRegisterDraftSnapshot() {
  return EMPTY_DRAFT;
}

export function updateRegisterDraftField(key, value) {
  const current = getRegisterDraftSnapshot();
  const next = { ...current, [key]: value };
  try {
    const raw = JSON.stringify(next);
    window.sessionStorage.setItem(DRAFT_KEY, raw);
    cachedRaw = raw;
    cachedParsed = next;
  } catch {
    cachedParsed = next;
  }
  for (const listener of listeners) {
    listener();
  }
}

export function clearRegisterDraft() {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignore storage failures.
  }
  cachedRaw = null;
  cachedParsed = EMPTY_DRAFT;
  for (const listener of listeners) {
    listener();
  }
}
