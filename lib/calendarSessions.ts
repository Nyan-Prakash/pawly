import type { PlanSession } from '@/types';

export interface CalendarDay {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isToday(date: Date): boolean {
  return toDateKey(date) === toDateKey(new Date());
}

export function getMonthGrid(year: number, month: number): CalendarDay[][] {
  const grid: CalendarDay[][] = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Start with the first day of the week (Sunday = 0)
  const startOffset = firstDayOfMonth.getDay();
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - startOffset);

  let currentDate = new Date(startDate);

  for (let week = 0; week < 6; week++) {
    const weekDays: CalendarDay[] = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(currentDate);
      weekDays.push({
        date,
        dateKey: toDateKey(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: isToday(date),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    grid.push(weekDays);

    // If the next week starts in a different month and we've already covered the current month, stop.
    if (currentDate.getMonth() !== month && week >= 3) {
        // Check if all days in the next week would be in the next month
        // Actually, most calendars show 6 weeks to keep layout stable or 5-6 weeks.
        // Let's stick to 6 weeks for a consistent look or dynamic 5/6.
    }
  }

  return grid;
}

export function groupSessionsByDate(sessions: PlanSession[]): Record<string, PlanSession[]> {
  const grouped: Record<string, PlanSession[]> = {};

  sessions.forEach(session => {
    if (session.scheduledDate) {
      if (!grouped[session.scheduledDate]) {
        grouped[session.scheduledDate] = [];
      }
      grouped[session.scheduledDate].push(session);
    }
  });

  // Sort sessions in each day by time
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
  });

  return grouped;
}

export function getDayStatus(dateKey: string, groupedSessions: Record<string, PlanSession[]>) {
  const sessions = groupedSessions[dateKey] || [];
  const hasSessions = sessions.length > 0;
  const allCompleted = hasSessions && sessions.every(s => s.isCompleted);
  const hasUpcoming = sessions.some(s => !s.isCompleted);

  return {
    hasSessions,
    allCompleted,
    hasUpcoming,
    sessionCount: sessions.length,
  };
}
