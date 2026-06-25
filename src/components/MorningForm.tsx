'use client';

import { useState } from 'react';
import type { DailyLog } from '@/lib/types';

export default function MorningForm({
  log,
  saveAction,
}: {
  log: DailyLog | null;
  saveAction: (formData: FormData) => Promise<void>;
}) {
  const [saved, setSaved] = useState(false);
  const hasMorning = !!(log?.morning_goal || log?.task_1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-border">
      <h2 className="font-serif text-navy text-sm font-bold tracking-wider mb-4">
        Morning
      </h2>
      <form
        action={async (formData) => {
          await saveAction(formData);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs text-brand-muted mb-1.5">今日のひとこと目標</label>
          <input
            name="morning_goal"
            defaultValue={log?.morning_goal || ''}
            placeholder="今日はこれをやりきる"
            className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-gold transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-brand-muted mb-1.5">今日やること</label>
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <span className="text-xs text-gold font-medium w-4">{n}</span>
                <input
                  name={`task_${n}`}
                  defaultValue={log ? (log as unknown as Record<string, unknown>)[`task_${n}`] as string || '' : ''}
                  placeholder={`やること ${n}`}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-navy text-white text-xs font-medium tracking-wide hover:bg-navy-light transition-colors"
          >
            {hasMorning ? '更新' : '記録する'}
          </button>
          {saved && <span className="text-xs text-gold">保存しました</span>}
        </div>
      </form>
    </div>
  );
}
