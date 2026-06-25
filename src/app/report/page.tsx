import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { DailyLog } from '@/lib/types';

function getToday() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().split('T')[0];
}

function getWeekStart(weeksAgo: number) {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const day = jst.getDay();
  const diff = day === 0 ? 6 : day - 1;
  jst.setDate(jst.getDate() - diff - weeksAgo * 7);
  return jst.toISOString().split('T')[0];
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

  // 直近4週間分のデータ
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

    // データがない週はスキップ（今週は常に表示）
    if (i > 0 && typedLogs.length === 0) continue;

    const recordedDays = typedLogs.filter((l) => l.morning_goal || l.task_1).length;
    const totalTasks = typedLogs.reduce((sum, l) => {
      return sum + [l.task_1, l.task_2, l.task_3].filter(Boolean).length;
    }, 0);
    const doneTasks = typedLogs.reduce((sum, l) => {
      return sum + [l.task_1_done, l.task_2_done, l.task_3_done].filter(Boolean).length;
    }, 0);
    const rate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // 日ごとの状態マップ
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
      <h1 className="font-serif text-navy text-lg font-bold tracking-wider">Weekly Report</h1>

      {weeks.length === 0 && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-brand-border text-center">
          <p className="text-sm text-brand-muted">まだ記録がありません</p>
        </div>
      )}

      {weeks.map((week, i) => (
        <div key={i} className={`bg-white rounded-xl p-5 shadow-sm border ${week.current ? 'border-gold/50' : 'border-brand-border'}`}>
          {/* 週ラベル */}
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm font-medium">{week.label}</p>
            {week.current && (
              <span className="text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded-full">今週</span>
            )}
          </div>

          {/* 曜日ドット */}
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

          {/* 数値サマリー */}
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

            {/* プログレスバー */}
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
