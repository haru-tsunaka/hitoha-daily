import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { DailyLog } from '@/lib/types';
import { getToday } from '@/lib/date';

export const dynamic = 'force-dynamic';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00Z');
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[d.getUTCDay()];
  return { formatted: `${month}/${day}（${weekday}）`, month, day, weekday };
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const today = getToday();

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .lte('date', today)
    .order('date', { ascending: false })
    .limit(90);

  const typedLogs = (logs || []) as DailyLog[];

  // 月ごとにグループ化
  const grouped: Record<string, DailyLog[]> = {};
  for (const log of typedLogs) {
    const monthKey = log.date.slice(0, 7); // "2026-06"
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(log);
  }

  const monthKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <h1 className="font-serif text-navy text-lg font-bold tracking-wider">History</h1>

      {typedLogs.length === 0 && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-brand-border text-center">
          <p className="text-sm text-brand-muted">まだ記録がありません</p>
        </div>
      )}

      {monthKeys.map((monthKey) => {
        const year = parseInt(monthKey.slice(0, 4));
        const month = parseInt(monthKey.slice(5, 7));
        const monthLogs = grouped[monthKey];

        return (
          <div key={monthKey}>
            <h2 className="font-serif text-navy/60 text-xs font-bold tracking-wider mb-3">
              {year}年{month}月
            </h2>
            <div className="space-y-3">
              {monthLogs.map((log) => {
                const { formatted } = formatDate(log.date);
                const isToday = log.date === today;
                const tasks = [
                  { text: log.task_1, done: log.task_1_done },
                  { text: log.task_2, done: log.task_2_done },
                  { text: log.task_3, done: log.task_3_done },
                ].filter((t) => t.text);
                const doneCount = tasks.filter((t) => t.done).length;
                const hasEvening = !!(log.evening_note || log.task_1_done || log.task_2_done || log.task_3_done);

                return (
                  <div
                    key={log.id}
                    className={`bg-white rounded-xl p-4 shadow-sm border ${isToday ? 'border-gold/50' : 'border-brand-border'}`}
                  >
                    {/* 日付ヘッダー */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{formatted}</p>
                        {isToday && (
                          <span className="text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded-full">今日</span>
                        )}
                      </div>
                      {tasks.length > 0 && (
                        <span className="text-xs text-brand-muted">{doneCount}/{tasks.length}</span>
                      )}
                    </div>

                    {/* 目標 */}
                    {log.morning_goal && (
                      <p className="text-sm text-brand-text/80 mb-2">{log.morning_goal}</p>
                    )}

                    {/* タスク一覧 */}
                    {tasks.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {tasks.map((task, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full border ${
                              task.done ? 'bg-gold border-gold' : 'border-brand-border'
                            }`} />
                            <span className={`text-xs ${task.done ? 'text-brand-text/60 line-through' : 'text-brand-text/80'}`}>
                              {task.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 振り返り */}
                    {log.evening_note && (
                      <div className="bg-brand-bg rounded-lg px-3 py-2 mt-2">
                        <p className="text-xs text-brand-text/70">{log.evening_note}</p>
                      </div>
                    )}

                    {/* 未完了ステータス */}
                    {!hasEvening && (log.morning_goal || log.task_1) && !isToday && (
                      <p className="text-[10px] text-brand-muted mt-1">振り返り未記入</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
