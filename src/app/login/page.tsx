'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Mode = 'login' | 'signup' | 'reset';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const router = useRouter();

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const supabase = createClient();

    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('パスワードリセットのメールを送信しました。メールを確認してください。');
      }
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      if (!nickname.trim()) {
        setError('ニックネームを入力してください');
        setLoading(false);
        return;
      }
      const { data: signUpData, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (signUpData.user) {
        await supabase.from('profiles').insert({
          id: signUpData.user.id,
          display_name: nickname.trim(),
        });
      }
      setMessage('確認メールを送信しました。メールを確認してください。');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません');
      setLoading(false);
      return;
    }

    localStorage.setItem('hitoha_daily_last_activity', Date.now().toString());
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 pt-20 bg-brand-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-navy text-3xl font-bold tracking-wider mb-2">Hitoha Daily</h1>
          <p className="text-brand-muted text-xs tracking-wide leading-relaxed">繋叶 -- いまと、これからを、ひとはにのせて。</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm border border-brand-border">
          <div className="mb-5">
            <label className="block text-xs text-brand-muted mb-1.5 tracking-wide">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-navy transition-colors"
              required
            />
          </div>

          {mode === 'signup' && (
            <div className="mb-5">
              <label className="block text-xs text-brand-muted mb-1.5 tracking-wide">ニックネーム</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="表示名"
                className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-navy transition-colors"
                required
              />
            </div>
          )}

          {mode !== 'reset' && (
            <div className="mb-6">
              <label className="block text-xs text-brand-muted mb-1.5 tracking-wide">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm focus:outline-none focus:border-navy transition-colors"
                required
                minLength={6}
              />
            </div>
          )}

          {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
          {message && <p className="text-navy text-xs mb-4">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-navy text-white font-medium text-sm tracking-wide hover:bg-navy-light transition-colors disabled:opacity-50"
          >
            {loading ? '処理中...' : mode === 'signup' ? '新規登録' : mode === 'reset' ? 'リセットメールを送信' : 'ログイン'}
          </button>

          {mode === 'login' && (
            <>
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="w-full mt-3 text-xs text-brand-muted hover:text-navy transition-colors"
              >
                パスワードを忘れた方はこちら
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="w-full mt-2 text-xs text-brand-muted hover:text-navy transition-colors"
              >
                はじめての方はこちら
              </button>
            </>
          )}

          {mode === 'signup' && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full mt-4 text-xs text-brand-muted hover:text-navy transition-colors"
            >
              アカウントをお持ちの方はこちら
            </button>
          )}

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full mt-4 text-xs text-brand-muted hover:text-navy transition-colors"
            >
              ログインに戻る
            </button>
          )}
        </form>

        <p className="text-center mt-4 text-[10px] text-brand-muted/60">
          ご利用により<Link href="/privacy" className="underline hover:text-navy transition-colors">プライバシーポリシー</Link>に同意したものとみなします
        </p>
      </div>
    </div>
  );
}
