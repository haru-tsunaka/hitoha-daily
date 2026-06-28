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
  const hasMorning = !!(log?.morning_goal || log?.task_1);
  const [editing, setEditing] = useState(!hasMorning);
  const [saved, setSaved] = useState(false);

  // 記録済み → ロック表示
  if (hasMorning && !editing) {
    const tasks = [log?.task_1, log?.task_2, log?.task_3].filter(Boolean);
    return (
      <div className="bg-brand-bg rounded-xl p-6 border border-brand-border/60">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-navy/60 text-sm font-bold tracking-wider">
            Morning
          </h2>
          <button
            onClick={() => setEditing(true)}
            className="text-[10px] text-brand-muted hover:text-navy transition-colors"
          >
            編集
          </button>
        </div>
        {log?.morning_goal && (
          <p className="text-sm text-brand-text/70 mb-2">{log.morning_goal}</p>
        )}
        {tasks.length > 0 && (
          <div className="space-y-1.5">
            {tasks.map((task, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gold/60 font-medium w-4">{i + 1}</span>
                <span className="text-sm text-brand-text/70">{task}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 未記録 or 編集中 → フォーム表示
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-navy text-sm font-bold tracking-wider">
          Morning
        </h2>
        {hasMorning && (
          <button
            onClick={() => setEditing(false)}
            className="text-[10px] text-brand-muted hover:text-navy transition-colors"
          >
            キャンセル
          </button>
        )}
      </div>
      <form
        action={async (formData) => {
          await saveAction(formData);
          setSaved(true);
          setEditing(false);
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
            className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-base focus:outline-none focus:border-gold transition-colors"
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
                  className="flex-1 px-4 py-2.5 rounded-lg border border-brand-border text-base focus:outline-none focus:border-gold transition-colors"
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
