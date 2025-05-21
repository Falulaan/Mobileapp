import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { saveHabitToStorage } from '../../utils/habit-helpers';

export default function AddHabitScreen() {
  const [habitName, setHabitName] = useState('');
  const [loading, setLoading] = useState(false);
  const maxLength = 32;

  const handleSubmit = () => {
    const name = habitName.trim();
    if (!name) {
      Alert.alert('Empty Field', 'Please enter a habit name.');
      return;
    }

    setLoading(true);
    saveHabitToStorage(
      name,
      () => {
        setHabitName('');
        setTimeout(() => router.back(), 1000);
        setLoading(false);
      },
      (errorMsg) => {
        Alert.alert('Error', errorMsg);
        setLoading(false);
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 justify-center bg-black px-4">
      <Text className="mb-4 text-2xl font-bold text-white">Add New Habit</Text>

      <TextInput
        className="mb-2 rounded-lg bg-gray-800 p-4 text-white"
        placeholder="e.g. Drink Water"
        placeholderTextColor="#aaa"
        value={habitName}
        onChangeText={setHabitName}
        maxLength={maxLength}
        editable={!loading}
      />

      <Text className="mb-4 text-right text-xs text-gray-500">
        {habitName.length}/{maxLength}
      </Text>

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        className={`rounded-lg py-4 ${
          loading ? 'bg-gray-600' : 'bg-green-600'
        }`}
      >
        <Text className="text-center text-base font-semibold text-white">
          {loading ? 'Saving...' : 'Save Habit'}
        </Text>
      </Pressable>

      <Toast />
    </SafeAreaView>
  );
}
