export function imageNoiseFixture(amount: number, seed: number) {
  if (
    !Number.isFinite(amount) ||
    amount < 0 ||
    amount > 1 ||
    !Number.isInteger(seed) ||
    seed < 1 ||
    seed > 3
  )
    throw new RangeError("Invalid image fixture controls");
  return Array.from({ length: 36 }, (_, i) => {
    const x = i % 6,
      y = Math.floor(i / 6);
    const clean = (x - 2.5) ** 2 + (y - 2.5) ** 2 < 5 ? 0.2 : 0.85;
    const disturbance = (((i * 37 + seed * 29) % 101) / 100) * 2 - 1;
    const raw = clean + amount * disturbance;
    return {
      id: i,
      x,
      y,
      clean,
      disturbance,
      raw,
      noisy: Math.max(0, Math.min(1, raw)),
    };
  });
}
