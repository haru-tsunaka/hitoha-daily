'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Notice = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
};

export default function NoticeBanner() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchNotice = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('notices')
        .select('id, title, body, created_at')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return;

      // 既に閉じたお知らせはスキップ
      const dismissedId = localStorage.getItem('hitoha_dismissed_notice');
      if (dismissedId === data.id) return;

      setNotice(data as Notice);
    };
    fetchNotice();
  }, []);

  if (!notice || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('hitoha_dismissed_notice', notice.id);
    setDismissed(true);
  };

  return (
    <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-navy">{notice.title}</p>
          {notice.body && (
            <p className="text-xs text-brand-text/70 mt-1">{notice.body}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-brand-muted/50 hover:text-brand-muted text-lg leading-none shrink-0 mt-0.5"
          aria-label="閉じる"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
