const POINTS = 5;
const INNER_RATIO = 0.5;

/** SVG path of a five-point star filling a `size` × `size` box, offset by `x`. */
export const starPath = (size: number, x = 0): string => {
  const outer = size / 2;
  const inner = outer * INNER_RATIO;
  const cx = x + outer;
  // Nudge the star down so its visual centre sits in the middle of the box.
  const cy = outer + size * 0.04;
  const vertices = Array.from({ length: POINTS * 2 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (index * Math.PI) / POINTS;
    const px = (cx + radius * Math.cos(angle)).toFixed(2);
    const py = (cy + radius * Math.sin(angle)).toFixed(2);
    return `${index === 0 ? 'M' : 'L'}${px} ${py}`;
  });
  return `${vertices.join(' ')} Z`;
};
