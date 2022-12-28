import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Text } from 'react-native-paper';
import * as Location from 'expo-location';
import {
  collection, onSnapshot, query, where,
} from 'firebase/firestore';
import { db } from '../../Firebase/config';
import { MyContext } from '../../../App';

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

const Maps = () => {
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [user, setUser, uiData, setUiData] = useContext(MyContext);

  const getAllServicesQuery = query(
    collection(db, 'service'),
    where('userUid', '!=', user.uid),
  );
  const [services, setServices] = useState();

  useEffect(() => {
    const subscribe = onSnapshot(getAllServicesQuery, (snapshot) => {
      setServices(snapshot.docs.map((doc) => { return { id: doc.id, ...doc.data() }; }));
    });

    return () => {
      subscribe();
    };
  }, [user]);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setMapRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };
  useEffect(() => {
    getLocation();
  }, []);
  return (
    <View style={styles.container}>
      <Text>
        asda
      </Text>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
      >
        <Marker coordinate={mapRegion} title="marker" />
        {services?.map((service) => {
          return (
            <Marker
              coordinate={{
                latitude: service.latitude,
                longitude: service.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              title="marker"
            />
          );
        })}
      </MapView>
    </View>
  );
};

export default Maps;
