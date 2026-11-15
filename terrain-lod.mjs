// The last level is the map's permanent coverage layer. Camera-centred fine
// levels can move off the map during orbit/zoom; moving the last one as well
// leaves holes even though the separate boundary skirt is still visible.
export function clipmapCenter(x, z, cell, outermost) {
  if (outermost) return { x: 0, z: 0 };
  const step = 2 * cell;
  return { x: Math.round(x / step) * step, z: Math.round(z / step) * step };
}
