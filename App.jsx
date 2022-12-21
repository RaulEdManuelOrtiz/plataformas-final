import React, { useState, useEffect, createContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'expo-dev-client';
import auth from '@react-native-firebase/auth';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import Login from './src/Views/Login';
import Maps from './src/Views/Maps';
import colors from './src/Utils/constants';
import Navigation from './src/Routes';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const MyContext = createContext();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  const theme = {
    ...MD3LightTheme,
    colors, // Copy it from the color codes scheme and then use it here
  };
  // const isLoadingComplete = useCachedResources();

  const onAuthStateChanged = (userData) => {
    setUser(userData);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (!user) {
    return (
      <View>
        <Login />
      </View>
    );
  }
  return (
    <MyContext.Provider value={user}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <Navigation />
          <StatusBar />
        </SafeAreaProvider>
      </PaperProvider>
    </MyContext.Provider>
  );
};
export default App;
