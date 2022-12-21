import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import routesList from './routesDictionary';
import CreateService from '../Components/CreateService';
import Header from '../Components/Header';

const BottomTab = createBottomTabNavigator();

const BottomNavigator = () => {
  return (
    <BottomTab.Navigator
      initialRouteName="allServices"
      sceneContainerStyle={{ backgroundColor: 'white' }}
      screenOptions={{
        // tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: false,
      }}
    >
      {routesList.map((route) => {
        return (
          <BottomTab.Screen
            name={route.name}
            key={route.key}
            // eslint-disable-next-line
            children={(props) => { return <route.component {...props} />; }}
            options={{
              title: route.title,
              // eslint-disable-next-line
              tabBarIcon: (props) => <FontAwesome {...props} name={route.icon} />,
              headerStyle: {
                backgroundColor: '#002B49',
              },
              headerTitleStyle: {
                color: 'white',
              },
            }}
          />
        );
      })}
    </BottomTab.Navigator>
  );
};

const Stack = createNativeStackNavigator();
const RootNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Root">
      <Stack.Screen
        name="Root"
        options={{
          headerShown: false,
          contentStyle: { background: 'white' },
        }}
      >
        {/*  eslint-disable-next-line */}
        {(props) =>  <BottomNavigator {...props}  />}
      </Stack.Screen>
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="CreateService"
          options={{
            contentStyle: { backgroundColor: 'white' },
            header: ({ navigation }) => {
              return (
                <Header
                  title="Solicitar servicio"
                  icon="chevron-left"
                  onPress={navigation.goBack}
                  iconSize={36}
                />
              );
            },
          }}
        >
          {/*  eslint-disable-next-line */}
          {(props) => { return <CreateService {...props} />; }}
        </Stack.Screen>
      </Stack.Group>
    </Stack.Navigator>
  );
};
const Navigation = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default Navigation;
