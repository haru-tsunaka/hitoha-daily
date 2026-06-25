export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  morning_goal: string | null;
  task_1: string | null;
  task_2: string | null;
  task_3: string | null;
  task_1_done: boolean;
  task_2_done: boolean;
  task_3_done: boolean;
  evening_note: string | null;
  created_at: string;
  updated_at: string;
}
