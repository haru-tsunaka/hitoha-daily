import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { DailyLog } from '@/lib/types';
import { getToday } from '@/lib/date';

export const dynamic = 'force-dynamic';

function getMonthRange() {
  const today = getToday();
  const year = parseInt(today.slice(0, 4));
  const month = parseInt(today.slice(5, 7));
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end, year, month, daysInMonth: lastDay };
}

function getWeekStart(weeksAgo: number) {
  const today = getToday();
  const d = new Date(today + 'T00:00:00Z');
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff - weeksAgo * 7);
  return d.toISOString().split('T')[0];
}

function getWeekDates(weekStart: string) {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function formatWeekRange(start: string, end: string) {
  const s = new Date(start + 'T00:00:00Z');
  const e = new Date(end + 'T00:00:00Z');
  return `${s.getUTCMonth() + 1}/${s.getUTCDate()} - ${e.getUTCMonth() + 1}/${e.getUTCDate()}`;
}

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];

export default async function ReportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const today = getToday();

  // --- マンスリーデータ ---
  const { start: monthStart, end: monthEnd, year, month, daysInMonth } = getMonthRange();
  const todayDay = parseInt(today.slice(8, 10));

  const { data: monthLogs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', monthStart)
    .lte('date', monthEnd)
    .order('date', { ascending: true });

  const typedMonthLogs = (monthLogs || []) as DailyLog[];
  const monthRecordedDays = typedMonthLogs.filter((l) => l.morning_goal || l.task_1).length;
  const monthTotalTasks = typedMonthLogs.reduce((sum, l) => {
    return sum + [l.task_1, l.task_2, l.task_3].filter(Boolean).length;
  }, 0);
  const monthDoneTasks = typedMonthLogs.reduce((sum, l) => {
    return sum + [l.task_1_done, l.task_2_done, l.task_3_done].filter(Boolean).length;
  }, 0);
  const monthRate = monthTotalTasks > 0 ? Math.round((monthDoneTasks / monthTotalTasks) * 100) : 0;

  // カレンダー用: 日ごとのステータス
  const firstDayOfWeek = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const calendarOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // 月曜始まり

  const calendarDays: { day: number; status: string }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const log = typedMonthLogs.find((l) => l.date === dateStr);
    const isFuture = dateStr > today;
    let status = 'empty';
    if (isFuture) status = 'future';
    else if (log && (log.morning_goal || log.task_1)) {
      status = (log.evening_note || log.task_1_done || log.task_2_done || log.task_3_done) ? 'complete' : 'morning';
    }
    calendarDays.push({ day: d, status });
  }

  // --- ウィークリーデータ ---
  const weeks = [];
  for (let i = 0; i < 4; i++) {
    const start = getWeekStart(i);
    const dates = getWeekDates(start);
    const end = dates[6];

    const { data: logs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: true });

    const typedLogs = (logs || []) as DailyLog[];

    if (i > 0 && typedLogs.length === 0) continue;

    const recordedDays = typedLogs.filter((l) => l.morning_goal || l.task_1).length;
    const totalTasks = typedLogs.reduce((sum, l) => {
      return sum + [l.task_1, l.task_2, l.task_3].filter(Boolean).length;
    }, 0);
    const doneTasks = typedLogs.reduce((sum, l) => {
      return sum + [l.task_1_done, l.task_2_done, l.task_3_done].filter(Boolean).length;
    }, 0);
    const rate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    const dayStatus = dates.map((date) => {
      const log = typedLogs.find((l) => l.date === date);
      const isFuture = date > today;
      if (isFuture) return 'future';
      if (!log || (!log.morning_goal && !log.task_1)) return 'empty';
      if (log.evening_note || log.task_1_done || log.task_2_done || log.task_3_done) return 'complete';
      return 'morning';
    });

    weeks.push({
      label: formatWeekRange(start, end),
      current: i === 0,
      recordedDays,
      totalTasks,
      doneTasks,
      rate,
      dayStatus,
    });
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      {/* マンスリーレポート */}
      <h1 className="font-serif text-navy text-lg font-bold tracking-wider">
        {month}月のまとめ
      </h1>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-brand-border">
        {/* カレンダー */}
        <div className="mb-4">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_LABELS.map((label) => (
              <div key={label} className="text-center text-[10px] text-brand-muted">{label}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* 月初の空白 */}
            {Array.from({ length: calendarOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {calendarDays.map(({ day, status }) => (
              <div key={day} className="flex items-center justify-center aspect-square">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
                  status === 'complete' ? 'bg-gold text-white font-bold' :
                  status === 'morning' ? 'bg-gold/20 text-navy/60' :
                  status === 'future' ? 'text-brand-muted/30' :
                  day === todayDay ? 'border border-navy/30 text-navy' :
                  'text-brand-muted/50'
                }`}>
                  {day}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* マンスリー数値 */}
        <div className="bg-brand-bg rounded-lg p-4">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-6">
              <div>
                <p className="text-[10px] text-brand-muted mb-0.5">記録</p>
                <p className="font-serif text-navy font-bold text-lg leading-none">
                  {monthRecordedDays}<span className="text-xs text-brand-muted font-normal"> / {todayDay}日</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-brand-muted mb-0.5">タスク</p>
                <p className="font-serif text-navy font-bold text-lg leading-none">
                  {monthDoneTasks}<span className="text-xs text-brand-muted font-normal"> / {monthTotalTasks}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-serif text-navy font-bold text-2xl leading-none">
                {monthRate}<span className="text-sm text-brand-muted font-normal">%</span>
              </p>
              <p className="text-[10px] text-brand-muted mt-0.5">達成率</p>
            </div>
          </div>

          <div className="mt-3 h-1.5 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all"
              style={{ width: `${monthRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* ウィークリーレポート */}
      <h2 className="font-serif text-navy text-base font-bold tracking-wider pt-2">Weekly</h2>

      {weeks.length === 0 && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-brand-border text-center">
          <p className="text-sm text-brand-muted">まだ記録がありません</p>
        </div>
      )}

      {weeks.map((week, i) => (
        <div key={i} className={`bg-white rounded-xl p-5 shadow-sm border ${week.current ? 'border-gold/50' : 'border-brand-border'}`}>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm font-medium">{week.label}</p>
            {week.current && (
              <span className="text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded-full">今週</span>
            )}
          </div>

          <div className="flex justify-between mb-4 px-1">
            {DAY_LABELS.map((label, j) => {
              const status = week.dayStatus[j];
              return (
                <div key={j} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-brand-muted">{label}</span>
                  <div className={`w-3.5 h-3.5 rounded-full ${
                    status === 'complete' ? 'bg-gold' :
                    status === 'morning' ? 'bg-gold/30' :
                    status === 'future' ? 'bg-brand-border/30' :
                    'bg-brand-border'
                  }`} />
                </div>
              );
            })}
          </div>

          <div className="bg-brand-bg rounded-lg p-4">
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-6">
                <div>
                  <p className="text-[10px] text-brand-muted mb-0.5">記録</p>
                  <p className="font-serif text-navy font-bold text-lg leading-none">
                    {week.recordedDays}<span className="text-xs text-brand-muted font-normal"> / 7日</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-brand-muted mb-0.5">タスク</p>
                  <p className="font-serif text-navy font-bold text-lg leading-none">
                    {week.doneTasks}<span className="text-xs text-brand-muted font-normal"> / {week.totalTasks}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-serif text-navy font-bold text-2xl leading-none">
                  {week.rate}<span className="text-sm text-brand-muted font-normal">%</span>
                </p>
                <p className="text-[10px] text-brand-muted mt-0.5">達成率</p>
              </div>
            </div>

            <div className="mt-3 h-1.5 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all"
                style={{ width: `${week.rate}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
