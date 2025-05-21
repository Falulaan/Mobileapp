import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// 👇 Your habit type definition
export type Habit = {
  name: string;
  checked: boolean;
  lastCheckedDate: string;
  streak: number;
};

// ✅ Toggle a habit’s status and update streak
export function handleHabitToggle(
  habits: Habit[],
  index: number,
  setHabits: (h: Habit[]) => void
) {
  const today = new Date().toISOString().split('T')[0];
  const updated = [...habits];
  const habit = updated[index];

  if (!habit.checked) {
    habit.streak += 1;
    habit.lastCheckedDate = today;
  } else {
    habit.streak = Math.max(0, habit.streak - 1);
    habit.lastCheckedDate = today;
  }

  habit.checked = !habit.checked;
  setHabits(updated);
}

// ✅ Add a new habit, if it doesn’t already exist
export async function saveHabitToStorage(
  name: string,
  onSuccess: () => void,
  onError: (message: string) => void
) {
  try {
    const stored = await AsyncStorage.getItem('habits');
    const habits: Habit[] = stored ? JSON.parse(stored) : [];

    const alreadyExists = habits.some(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      onError('You already added this habit.');
      return;
    }

    const newHabit: Habit = {
      name,
      checked: false,
      lastCheckedDate: '',
      streak: 0,
    };

    const updated = [...habits, newHabit];
    await AsyncStorage.setItem('habits', JSON.stringify(updated));

    Toast.show({
      type: 'success',
      text1: 'Habit added!',
      text2: `"${name}" was saved.`,
    });

    onSuccess();
  } catch {
    onError('Failed to save habit.');
  }
}
