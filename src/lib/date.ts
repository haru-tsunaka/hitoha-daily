/**
 * 日付の境界を午前4時に設定。
 * 0:00〜3:59 は「前日」として扱う。
 */
export function getToday(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  // 4時間引くことで、0:00-3:59 → 前日扱い
  jst.setHours(jst.getHours() - 4);
  return jst.toISOString().split('T')[0];
}

/** 今日を含む直近7日分の日付配列（古い順） */
export function getWeekDates(): string[] {
  const today = getToday();
  const base = new Date(today + 'T00:00:00Z');
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}
