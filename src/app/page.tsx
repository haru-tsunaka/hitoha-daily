import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { DailyLog } from '@/lib/types';
import { getToday, getWeekDates } from '@/lib/date';
import MorningForm from '@/components/MorningForm';

export const dynamic = 'force-dynamic';
import EveningForm from '@/components/EveningForm';
import Streak from '@/components/Streak';
import Timeline from '@/components/Timeline';

async function calculateStreak(supabase: ReturnType<Awaited<ReturnType<typeof createClient>> extends infer T ? () => T : never>, userId: string) {
  const { data: logs } = await (await createClient())
    .from('daily_logs')
    .select('date')
    .eq('user_id', userId)
    .not('morning_goal', 'is', null)
    .order('date', { ascending: false })
    .limit(365);

  if (!logs || logs.length === 0) return 0;

  let streak = 0;
  const today = getToday();
  const checkDate = new Date(today + 'T00:00:00+09:00');

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (logs.some((l) => l.date === dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const today = getToday();
  const weekDates = getWeekDates();

  // プロフィール取得（なければuser_metadataから自動作成）
  let { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single();

  if (!profile && user.user_metadata?.display_name) {
    await supabase.from('profiles').insert({
      id: user.id,
      display_name: user.user_metadata.display_name,
    });
    profile = { display_name: user.user_metadata.display_name };
  }

  // 曜日
  const todayDate = new Date(today + 'T00:00:00Z');
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const todayWeekday = weekdays[todayDate.getUTCDay()];

  // 今日のログ
  const { data: todayLog } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  // 直近7日のログ
  const { data: weekLogs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .in('date', weekDates)
    .order('date', { ascending: false });

  // ストリーク計算（morning_goal または task_1 があれば記録した日とみなす）
  const { data: streakLogs } = await supabase
    .from('daily_logs')
    .select('date, morning_goal, task_1')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(365);

  let streak = 0;
  if (streakLogs && streakLogs.length > 0) {
    const activeLogs = streakLogs.filter((l) => l.morning_goal || l.task_1);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today + 'T00:00:00Z');
      d.setUTCDate(d.getUTCDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (activeLogs.some((l) => l.date === dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
  }

  // 7日分のデータを埋める（記録がない日も表示）
  const weekData: DailyLog[] = weekDates.map((date) => {
    const found = weekLogs?.find((l) => l.date === date);
    if (found) return found as DailyLog;
    return {
      id: '',
      user_id: user.id,
      date,
      morning_goal: null,
      task_1: null,
      task_2: null,
      task_3: null,
      task_1_done: false,
      task_2_done: false,
      task_3_done: false,
      evening_note: null,
      created_at: '',
      updated_at: '',
    };
  }).reverse();

  async function saveMorning(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const today = getToday();
    const data = {
      morning_goal: (formData.get('morning_goal') as string) || null,
      task_1: (formData.get('task_1') as string) || null,
      task_2: (formData.get('task_2') as string) || null,
      task_3: (formData.get('task_3') as string) || null,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (existing) {
      await supabase.from('daily_logs').update(data).eq('id', existing.id);
    } else {
      await supabase.from('daily_logs').insert({
        ...data,
        user_id: user.id,
        date: today,
      });
    }

    revalidatePath('/');
  }

  async function saveEvening(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const today = getToday();
    const data = {
      task_1_done: formData.get('task_1_done') === 'true',
      task_2_done: formData.get('task_2_done') === 'true',
      task_3_done: formData.get('task_3_done') === 'true',
      evening_note: (formData.get('evening_note') as string) || null,
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from('daily_logs')
      .update(data)
      .eq('user_id', user.id)
      .eq('date', today);

    revalidatePath('/');
  }

  const status = todayLog?.evening_note ? 'complete' : (todayLog?.morning_goal || todayLog?.task_1) ? 'morning' : 'empty';
  const statusLabel = { complete: '今日の記録完了', morning: '振り返りがまだです', empty: 'まだ記録していません' };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      {/* ステータス + ストリーク */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-brand-muted">{today.replace(/-/g, '/')}（{todayWeekday}）</p>
          <p className="text-sm font-medium mt-0.5">
            {profile?.display_name && <span className="text-navy">{profile.display_name}さん、</span>}
            {statusLabel[status]}
          </p>
        </div>
        <Streak count={streak} />
      </div>

      {/* 朝の記録 */}
      <MorningForm log={todayLog as DailyLog | null} saveAction={saveMorning} />

      {/* 夜の振り返り */}
      <EveningForm log={todayLog as DailyLog | null} saveAction={saveEvening} />

      {/* 直近7日間 */}
      <Timeline logs={weekData} />
    </div>
  );
}
