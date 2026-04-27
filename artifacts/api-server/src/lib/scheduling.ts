export const SALON_OPEN_HOUR = 9;
export const SALON_CLOSE_HOUR = 19;
export const SLOT_INTERVAL_MINUTES = 30;

export function generateCandidateStarts(date: string): Date[] {
  const result: Date[] = [];
  for (let h = SALON_OPEN_HOUR; h < SALON_CLOSE_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL_MINUTES) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      result.push(new Date(`${date}T${hh}:${mm}:00.000Z`));
    }
  }
  return result;
}

export function overlaps(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
