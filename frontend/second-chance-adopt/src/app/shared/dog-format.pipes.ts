import { Pipe, PipeTransform } from '@angular/core';

/** 8 -> "8 months", 12 -> "1 year", 18 -> "1 year 6 months", 36 -> "3 years". */
@Pipe({ name: 'age', standalone: true })
export class AgePipe implements PipeTransform {
  transform(totalMonths: number | null | undefined): string {
    if (totalMonths == null || Number.isNaN(totalMonths)) {
      return 'Age unknown';
    }
    const months = Math.max(0, Math.round(totalMonths));
    if (months < 12) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    const years = Math.floor(months / 12);
    const rest = months % 12;
    const y = `${years} ${years === 1 ? 'year' : 'years'}`;
    return rest === 0 ? y : `${y} ${rest} ${rest === 1 ? 'month' : 'months'}`;
  }
}

/** ISO date -> "Today", "1 day", "63 days". */
@Pipe({ name: 'daysWaiting', standalone: true })
export class DaysWaitingPipe implements PipeTransform {
  transform(iso: string | null | undefined): string {
    return formatDaysWaiting(daysSince(iso));
  }
}

export function daysSince(iso: string | null | undefined): number {
  if (!iso) {
    return 0;
  }
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return 0;
  }
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
}

export function formatDaysWaiting(days: number): string {
  if (days <= 0) {
    return 'Today';
  }
  return days === 1 ? '1 day' : `${days} days`;
}
