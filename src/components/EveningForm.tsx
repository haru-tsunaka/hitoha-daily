'use client';

import { useState } from 'react';
import type { DailyLog } from '@/lib/types';

export default function EveningForm({
  log,
  saveAction,
}: {
  log: DailyLog | null;
  saveAction: (formData: FormData) => Promise<void>;
}) {
  const tasks = [
    { key: 'task_1', doneKey: 'task_1_done', label: log?.task_1 },
    { key: 'task_2', doneKey: 'task_2_done', label: log?.task_2 },
    { key: 'task_3', doneKey: 'task_3_done', label: log?.task_3 },
  ];

  const hasTasks = tasks.some((t) => t.label);
  if (!hasTasks && !log?.morning_goal) return null;

  const hasEvening = !!(log?.evening_note || log?.task_1_done || log?.task_2_done || log?.task_3_done);
  const [editing, setEditing] = useState(!hasEvening);
  const [saved, setSaved] = useState(false);

  // 記録済み → ロック表示
  if (hasEvening && !editing) {
    const doneCount = [log?.task_1_done, log?.task_2_done, log?.task_3_done].filter(Boolean).length;
    const taskCount = tasks.filter((t) => t.label).length;
    return (
      <div className="bg-brand-bg rounded-xl p-6 border border-brand-border/60">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-navy/60 text-sm font-bold tracking-wider">
            Evening
          </h2>
          <button
            onClick={() => setEditing(true)}
            className="text-[10px] text-brand-muted hover:text-navy transition-colors"
          >
            編集
          </button>
        </div>
        {taskCount > 0 && (
          <div className="space-y-1.5 mb-2">
            {tasks.map((task, i) => {
              if (!task.label) return null;
              const done = log ? (log as unknown as Record<string, unknown>)[task.doneKey] as boolean : false;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className={`text-xs ${done ? 'text-gold/60' : 'text-brand-muted/40'}`}>
                    {done ? '---' : '　　'}
                  </span>
                  <span className={`text-sm ${done ? 'text-brand-text/70 line-through' : 'text-brand-text/40'}`}>
                    {task.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {log?.evening_note && (
          <p className="text-sm text-brand-text/70">{log.evening_note}</p>
        )}
      </div>
    );
  }

  // 未記録 or 編集中 → フォーム表示
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-navy text-sm font-bold tracking-wider">
          Evening
        </h2>
        {hasEvening && (
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
        {hasTasks && (
          <div>
            <label className="block text-xs text-brand-muted mb-2">できたことにチェック</label>
            <div className="space-y-2">
              {tasks.map((task, i) => {
                if (!task.label) return null;
                const done = log ? (log as unknown as Record<string, unknown>)[task.doneKey] as boolean : false;
                return (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name={task.doneKey}
                      value="true"
                      defaultChecked={done}
                      className="w-4 h-4 rounded border-brand-border text-gold accent-gold"
                    />
                    <span className={`text-sm ${done ? 'text-brand-muted' : 'text-brand-text'}`}>
                      {task.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
        <div>
          <label className="block text-xs text-brand-muted mb-1.5">ひとこと振り返り</label>
          <textarea
            name="evening_note"
            defaultValue={log?.evening_note || ''}
            placeholder="今日はどうだった？"
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-gold transition-colors resize-none"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-navy text-white text-xs font-medium tracking-wide hover:bg-navy-light transition-colors"
          >
            {hasEvening ? '更新' : '振り返りを記録'}
          </button>
          {saved && <span className="text-xs text-gold">保存しました</span>}
        </div>
      </form>
    </div>
  );
}
