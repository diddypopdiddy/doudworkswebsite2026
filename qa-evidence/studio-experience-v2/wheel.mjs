// Shortest signed arc prevents a jump when the pointer crosses -π / +π.
export function angleDelta(previous, next) {
  return Math.atan2(Math.sin(next - previous), Math.cos(next - previous));
}
export function wheelStep(remainder, delta, threshold = 0.34) {
  const total = remainder + delta;
  const steps = Math.trunc(total / threshold);
  return { steps, remainder: total - steps * threshold };
}
export function clampIndex(index, length) { return Math.max(0, Math.min(length - 1, index)); }
export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}
