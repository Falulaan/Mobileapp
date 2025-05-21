import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  type Habit as HabitType,
  handleHabitToggle,
} from '../../utils/habit-helpers';

async function loadHabits(setHabits: (h: HabitType[]) => void) {
  try {
    const stored = await AsyncStorage.getItem('habits');
    const parsed: HabitType[] = stored ? JSON.parse(stored) : [];

    const today = dayjs().format('YYYY-MM-DD');

    const updated = parsed.map((habit) => {
      if (habit.lastCheckedDate !== today) {
        habit.checked = false;
      }
      return habit;
    });

    setHabits(updated);
    await AsyncStorage.setItem('habits', JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to load habits:', err);
  }
}

export default function HabitScreen() {
  const [habits, setHabits] = useState<HabitType[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadHabits(setHabits);
    }, [])
  );

  const toggleHabit = (index: number) => {
    handleHabitToggle(habits, index, setHabits);
  };

  const deleteHabit = (index: number) => {
    Alert.alert('Delete Habit', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = habits.filter((_, i) => i !== index);
          setHabits(updated);
          await AsyncStorage.setItem('habits', JSON.stringify(updated));
          Toast.show({ type: 'success', text1: 'Habit deleted' });
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Header habits={habits} />
      <FlatList
        data={habits}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 12 }}
        renderItem={({ item, index }) => (
          <HabitItem
            item={item}
            index={index}
            onToggle={toggleHabit}
            onDelete={deleteHabit}
          />
        )}
      />
      <Footer />
      <Toast />
    </SafeAreaView>
  );
}

function Header({ habits }: { habits: HabitType[] }) {
  const completed = habits.filter((h) => h.checked).length;
  const total = habits.length;
  const progress = total === 0 ? 0 : completed / total;

  return (
    <View className="px-4 pt-4">
      <Text className="mb-2 text-xl font-bold text-white">Today’s Habits</Text>
      <View className="mb-4 h-3 w-full overflow-hidden rounded-full bg-gray-800">
        <View
          style={{ width: `${progress * 100}%` }}
          className="h-full bg-green-500"
        />
      </View>
    </View>
  );
}

function HabitItem({
  item,
  index,
  onToggle,
  onDelete,
}: {
  item: HabitType;
  index: number;
  onToggle: (index: number) => void;
  onDelete: (index: number) => void;
}) {
  return (
    <GestureHandlerRootView>
      <Swipeable
        renderRightActions={() => (
          <View className="h-full flex-row items-center">
            <Pressable
              onPress={() => onDelete(index)}
              className="h-full justify-center rounded-r-xl bg-red-600 px-5"
            >
              <Text className="font-bold text-white">Delete</Text>
            </Pressable>
          </View>
        )}
      >
        <Pressable
          onPress={() => onToggle(index)}
          className={`mb-3 rounded-xl p-4 ${
            item.checked ? 'bg-green-600' : 'bg-gray-800'
          }`}
        >
          <Text className="text-base font-semibold text-white">
            {item.name}
          </Text>
          <Text className="text-sm text-gray-300">
            {item.checked ? '✔ Completed' : 'Tap to mark done'}
          </Text>
          <Text className="mt-1 text-xs text-orange-300">
            🔥 Streak: {item.streak} | Last: {item.lastCheckedDate || 'Never'}
          </Text>
        </Pressable>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

function Footer() {
  return (
    <View className="absolute bottom-4 w-full px-4">
      <Pressable
        onPress={() => router.push('/habits/add')}
        className="rounded-xl bg-blue-500 py-4"
      >
        <Text className="text-center text-base font-semibold text-white">
          + Add Habit
        </Text>
      </Pressable>
    </View>
  );
}
