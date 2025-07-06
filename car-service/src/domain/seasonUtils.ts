import { Season } from './Car';

export function getSeason(date: Date): Season {
  const month = date.getMonth() + 1; // JS months are 0-based
  const day = date.getDate();

  // Peak: 1st June - 15th Sept
  if (
    (month === 6 && day >= 1) ||
    (month > 6 && month < 9) ||
    (month === 9 && day <= 15)
  ) {
    return 'peak';
  }
  // Mid: 15th Sept - 31st Oct, 1st Mar - 1st June
  if (
    (month === 9 && day > 15) ||
    (month === 10) ||
    (month === 3) ||
    (month > 3 && month < 6) ||
    (month === 6 && day === 1)
  ) {
    return 'mid';
  }
  // Off: 1st Nov - 1st Mar
  return 'off';
}

export function getSeasonsInRange(start: Date, end: Date): Season[] {
  const seasons = new Set<Season>();
  let current = new Date(start);
  while (current <= end) {
    seasons.add(getSeason(current));
    current.setDate(current.getDate() + 1);
  }
  return Array.from(seasons);
} 