const TINTS = ['lavender', 'mint', 'peach', 'sky', 'butter'];

const TINT_CARD_CLASSES = {
  lavender: 'bg-tint-lavender/55 shadow-tint-lavender',
  mint: 'bg-tint-mint/55 shadow-tint-mint',
  peach: 'bg-tint-peach/55 shadow-tint-peach',
  sky: 'bg-tint-sky/55 shadow-tint-sky',
  butter: 'bg-tint-butter/55 shadow-tint-butter',
};

const TINT_FULL_CLASSES = {
  lavender: 'bg-tint-lavender shadow-tint-lavender',
  mint: 'bg-tint-mint shadow-tint-mint',
  peach: 'bg-tint-peach shadow-tint-peach',
  sky: 'bg-tint-sky shadow-tint-sky',
  butter: 'bg-tint-butter shadow-tint-butter',
};

const TILTS = [-0.6, 0.4, -0.3, 0.7];
const OFFSETS = [0, 24, 8];
const MASONRY_ASPECTS = [
  'aspect-[4/5]',
  'aspect-square',
  'aspect-[3/4]',
  'aspect-[5/6]',
];

export function tintAt(index = 0) {
  return TINTS[Math.abs(index) % TINTS.length];
}

export function tintCardClassAt(index = 0, full = false) {
  const key = tintAt(index);
  return full ? TINT_FULL_CLASSES[key] : TINT_CARD_CLASSES[key];
}

export function tintFullClassByName(name = 'lavender') {
  return TINT_FULL_CLASSES[name] || TINT_FULL_CLASSES.lavender;
}

export function tiltAt(index = 0) {
  return TILTS[Math.abs(index) % TILTS.length];
}

export function offsetAt(index = 0) {
  return OFFSETS[Math.abs(index) % OFFSETS.length];
}

export function masonryAspectAt(index = 0) {
  return MASONRY_ASPECTS[Math.abs(index) % MASONRY_ASPECTS.length];
}

/**
 * Memperbarui koordinat sorotan kursor (--mx, --my) untuk elemen `.spotlight-surface`.
 */
export function updateSpotlightPosition(event) {
  if (event.pointerType && event.pointerType !== 'mouse') return;
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
  const y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
  event.currentTarget.style.setProperty('--mx', `${x.toFixed(1)}%`);
  event.currentTarget.style.setProperty('--my', `${y.toFixed(1)}%`);
}
