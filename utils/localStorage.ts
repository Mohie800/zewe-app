import AsyncStorage from '@react-native-async-storage/async-storage';

// Save data
export const saveData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Failed to save data:', error);
  }
};

// Retrieve data
export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Failed to retrieve data:', error);
    return null;
  }
};

// Example usage
