import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { DailyLog } from '@/lib/types';

function getWeekStart(weeksAgo: number) {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const day = jst.getDay();
  const diff = day === 0 ? 6 : day - 1; // 月曜始まり
  jst.setDate(jst.getDate() - diff - weeksAgo * 7);
  return jst.toISOString().split('T')[0];
}

function getWeekEnd(weekStart: string) {
  const d = new Date(weekStart + 'T00:00:00+09:00');
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
}

function formatWeekRange(start: string, end: string) {
  const s = new Date(start + 'T00:00:00+09:00');
  const e = new Date(end + 'T00:00:00+09:00');
  return `${s.getMonth() + 1}/${s.getDate()} - ${e.getMonth() + 1}/${e.getDate()}`;
}

export default async function ReportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 直近4週間分のデータ
  const weeks = [];
  for (let i = 0; i < 4; i++) {
    const start = getWeekStart(i);
    const end = getWeekEnd(start);

    const { data: logs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: true });

    const typedLogs = (logs || []) as DailyLog[];
    const recordedDays = typedLogs.filter((l) => l.morning_goal || l.task_1).length;
    const totalTasks = typedLogs.reduce((sum, l) => {
      return sum + [l.task_1, l.task_2, l.task_3].filter(Boolean).length;
    }, 0);
    const doneTasks = typedLogs.reduce((sum, l) => {
      return sum + [l.task_1_done, l.task_2_done, l.task_3_done].filter(Boolean).length;
    }, 0);

    weeks.push({
      label: formatWeekRange(start, end),
      current: i === 0,
      recordedDays,
      totalTasks,
      doneTasks,
      rate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    });
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <h1 className="font-serif text-navy text-lg font-bold tracking-wider">Weekly Report</h1>

      {weeks.map((week, i) => (
        <div key={i} className={`bg-white rounded-xl p-6 shadow-sm border ${week.current ? 'border-gold/50' : 'border-brand-border'}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">
              {week.label}
              {week.current && <span className="text-xs text-gold ml-2">今週</span>}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-serif text-2xl text-navy font-bold">{week.recordedDays}</p>
              <p className="text-[10px] text-brand-muted mt-0.5">記録日数 / 7</p>
            </div>
            <div>
              <p className="font-serif text-2xl text-navy font-bold">{week.doneTasks}<span className="text-sm text-brand-muted">/{week.totalTasks}</span></p>
              <p className="text-[10px] text-brand-muted mt-0.5">タスク達成</p>
            </div>
            <div>
              <p className="font-serif text-2xl text-navy font-bold">{week.rate}<span className="text-sm text-brand-muted">%</span></p>
              <p className="text-[10px] text-brand-muted mt-0.5">達成率</p>
            </div>
          </div>

          {/* プログレスバー */}
          <div className="mt-3 h-1.5 bg-brand-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all"
              style={{ width: `${week.rate}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
