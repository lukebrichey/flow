import Dexie from 'dexie';

// Interface for pomodoro preferences
interface IPreference {
  id?: number;
  pomodoroLength: number;
  shortBreakLength: number;
  longBreakLength: number;
  pomodoroCount: number;
}

// Interface for focus stats
interface IFocusStat {
  id?: number;
  totalFocusTime: number;
  weeklyFocusTime?: number;
  monthlyFocusTime?: number;
}

// Interface for daily focus goals and streaks
interface IDailyFocusGoal {
  id?: number;
  date: Date;
  focusGoal: number; // Number of minutes the user wants to focus for each day
  focusStreak: number; // Number of days in a row that the user has met their focus goal
}

const DEFAULT_PREFERENCES: IPreference = {
  pomodoroLength: 30,
  shortBreakLength: 5,
  longBreakLength: 15,
  pomodoroCount: 4
};

const DEFAULT_FOCUS_GOAL: IDailyFocusGoal = {
  date: new Date(),
  focusGoal: 120, // 2 hours
  focusStreak: 0
};

// No need for default values for focus stats, as they are updated on the fly

class MyDatabase extends Dexie {
  // Add definite assignment assertion
  preferences: Dexie.Table<IPreference, number>;
  focusStats: Dexie.Table<IFocusStat, number>;
  dailyFocusGoals: Dexie.Table<IDailyFocusGoal, number>;

  constructor() {
    super('MyDatabase');

    this.version(1).stores({
      preferences: '++id, pomodoroLength, shortBreakLength, longBreakLength, pomodoroCount',
      focusStats: '++id, totalFocusTime, weeklyFocusTime, monthlyFocusTime',
      dailyFocusGoals: '++id, date, focusGoal, focusStreak'
    });

    this.preferences = this.table('preferences');
    this.focusStats = this.table('focusStats');
    this.dailyFocusGoals = this.table('dailyFocusGoals');

    // Populate the database with default preferences if none are found
    this.preferences.count().then((count) => {
      if (count === 0) {
        this.preferences.add(DEFAULT_PREFERENCES);
      }
    });

    // Populate the database with default focus goals if none are found
    this.dailyFocusGoals.count().then((count) => {
      if (count === 0) {
        this.dailyFocusGoals.add(DEFAULT_FOCUS_GOAL);
      }
    });
  }
}

const db = new MyDatabase();

// Function to get preferences from the database
export const getPreferences = async (): Promise<IPreference> => {
  const allPreferences = await db.preferences.toArray();
  return allPreferences[0]; // Assumes one set of preferences per user
};

// Function to get the latest focus time
export const getFocusTime = async (): Promise<number> => {
  const latestStat = await db.focusStats.orderBy('id').reverse().first();
  return latestStat?.totalFocusTime || 0;
};

// Function to update the focus time
export const updateFocusTime = async (newFocusTime: number): Promise<void> => {
  await db.focusStats.update(1, { totalFocusTime: newFocusTime });
};

// Function to get the latest focus goal
export const getFocusGoal = async (): Promise<number> => {
  const latestGoal = await db.dailyFocusGoals.orderBy('id').reverse().first();
  return latestGoal?.focusGoal || DEFAULT_FOCUS_GOAL.focusGoal;
};

// Function to update the focus goal
export const updateFocusGoal = async (newFocusGoal: number): Promise<void> => {
  await db.dailyFocusGoals.update(1, { focusGoal: newFocusGoal });
};

// Function to get the latest focus streak
export const getFocusStreak = async (): Promise<number> => {
  const latestGoal = await db.dailyFocusGoals.orderBy('id').reverse().first();
  return latestGoal?.focusStreak || DEFAULT_FOCUS_GOAL.focusStreak;
};

// Function to update the focus streak
export const updateFocusStreak = async (newFocusStreak: number): Promise<void> => {
  await db.dailyFocusGoals.update(1, { focusStreak: newFocusStreak });
};

export const incrementFocusStreak = async (currentFocusTime: number): Promise<void> => {
  const focusGoal = await getFocusGoal();
  const focusStreak = await getFocusStreak();
  if (currentFocusTime >= focusGoal) {
    await updateFocusStreak(focusStreak + 1);
  }
};

// Use 'export type' for re-exporting types
export type { IPreference, IFocusStat };
export { db };
