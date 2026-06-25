import type { DailyLog } from '@/lib/types';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00+09:00');
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[d.getDay()];
  return `${month}/${day}（${weekday}）`;
}

function getStatus(log: DailyLog): 'complete' | 'morning' | 'empty' {
  if (log.evening_note || log.task_1_done || log.task_2_done || log.task_3_done) return 'complete';
  if (log.morning_goal || log.task_1) return 'morning';
  return 'empty';
}

const statusStyles = {
  complete: 'border-gold bg-gold/20',
  morning: 'border-gold/50 bg-white',
  empty: 'border-brand-border bg-white',
};

export default function Timeline({ logs }: { logs: DailyLog[] }) {
  if (logs.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-border">
      <h2 className="font-serif text-navy text-sm font-bold tracking-wider mb-4">
        This Week
      </h2>
      <div className="space-y-3">
        {logs.map((log, index) => {
          const status = getStatus(log);
          const doneCount = [log.task_1_done, log.task_2_done, log.task_3_done].filter(Boolean).length;
          const taskCount = [log.task_1, log.task_2, log.task_3].filter(Boolean).length;
          return (
            <div key={log.id || index} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${statusStyles[status]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-brand-muted">{formatDate(log.date)}</p>
              </div>
              {status !== 'empty' && (
                <div className="text-xs text-brand-muted">
                  {taskCount > 0 && <span>{doneCount}/{taskCount}</span>}
                </div>
              )}
              {status === 'complete' && (
                <span className="text-xs text-gold font-medium">Done</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
