import React, { useContext, useEffect, useState } from 'react';
import {
  Image, ScrollView, StyleSheet, View,
} from 'react-native';
import {
  ActivityIndicator,
  Button, Chip, Modal, Portal, Text, TextInput, TouchableRipple,
} from 'react-native-paper';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import {
  createServiceFunc, getCategories, uploadImage,
} from '../../Firebase/utils';
import { primaryColor } from '../../Utils/constants';
import { MyContext } from '../../../App';

const styles = StyleSheet.create({
  view: {
    paddingHorizontal: 25,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  cardTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  formItem: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F6F6F9',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    height: '80%',
  },
  address: {
    height: 68,
    backgroundColor: '#F6F6F9',
    borderRadius: 10,
  },
  addressText: {
    marginLeft: 16,
    marginTop: 8,
  },
  map: {
    width: '100%',
    height: 260,
    borderRadius: 10,
  },
  label: {
    marginBottom: 8,
  },
  component: {
    marginBottom: 28,
  },
});

const CreateService = ({ navigation }) => {
  const [createServiceLoading, setCreateServiceLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const user = useContext(MyContext);
  const [description, setDescription] = useState('');
  const [serviceName, setServiceName] = useState('');

  const [categorySelected, setCategorySelected] = useState();
  const [categories, setCategories] = useState([]);

  const [userAddress, setUserAddress] = useState('');
  const [userPosition, serUserPosition] = useState();

  useEffect(() => {
    getCategories(setCategories);
  }, []);
  const [mapRegion, setMapRegion] = useState();

  const [image, setImage] = useState(null);

  const selectImageFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const selectImageFromFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUserPosition = async () => {
    if (userPosition) {
      const address = await Location.reverseGeocodeAsync({
        latitude: userPosition.latitude,
        longitude: userPosition.longitude,
      });
      setUserAddress(`${address[0].street} ${address[0].streetNumber} - ${address[0].city}`);
    }
  };

  useEffect(() => {
    getUserPosition();
  }, [userPosition]);

  // console.log('Locationa', requestForegroundPermissionsAsync);
  const userLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.log('not permissions');
    }
    const { coords } = await Location.getCurrentPositionAsync();
    setMapRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    const address = await Location.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    setUserAddress(`${address[0].street} ${address[0].streetNumber || ''} - ${address[0].city}`);
    serUserPosition({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
    setLoadingLocation(false);
  };

  useEffect(() => {
    userLocation();
  }, []);

  const handleCreateService = () => {
    setCreateServiceLoading(true);
    createServiceFunc({
      categoryId: categorySelected,
      description,
      title: serviceName,
      image,
      latitude: userPosition.latitude,
      longitude: userPosition.longitude,
      address: userAddress,
      status: 'Creado',
      setLoading: setCreateServiceLoading,
      userUid: user.uid,
    })
      .then(() => {
        return navigation.navigate('MyServices');
      });
  };

  return (
    <ScrollView style={styles.view}>
      <View>
        <View style={styles.label}>
          <Text variant="labelLarge">
            Seleccione las categorías del servicio
          </Text>
        </View>
        <View style={{ flexDirection: 'row', ...styles.component }}>
          {categories.map((category) => {
            return (
              <Chip
                mode={categorySelected === category.id ? 'flat' : 'outlined'}
                key={category.id}
                onPress={() => { setCategorySelected(category.id); }}
                style={{ marginRight: 10 }}
              >
                {category.name}
              </Chip>
            );
          })}
        </View>
      </View>
      <View>
        <View style={styles.label}>
          <Text variant="labelLarge">
            Resumen del servicio
          </Text>
        </View>
        <View style={styles.component}>
          <TextInput
            mode="outlined"
            value={serviceName}
            onChangeText={(text) => { return setServiceName(text); }}
            outlineStyle={{ borderRadius: 12 }}
            style={styles.input}
            activeOutlineColor="transparent"
            outlineColor="transparent"
            textColor={primaryColor}
            selectionColor={primaryColor}
          />
        </View>
      </View>
      <View>
        <View style={styles.label}>
          <Text variant="labelLarge">
            Desripción
          </Text>
        </View>
        <View style={styles.component}>
          <TextInput
            mode="outlined"
            value={description}
            onChangeText={(text) => { return setDescription(text); }}
            outlineStyle={{ borderRadius: 12 }}
            multiline
            numberOfLines={4}
            style={styles.input}
            activeOutlineColor="transparent"
            outlineColor="transparent"
            textColor={primaryColor}
            selectionColor={primaryColor}
          />
        </View>
      </View>
      <View>
        <View style={styles.label}>
          <Text variant="labelLarge">
            Ubicación donde realizar el servicio
          </Text>
        </View>
        <View style={styles.component}>
          <TextInput
            mode="outlined"
            value={userAddress}
            onChangeText={(text) => { return setDescription(text); }}
            outlineStyle={{ borderRadius: 12 }}
            style={styles.input}
            theme={{ colors: { primary: primaryColor } }}
            multiline
            numberOfLines={4}
            disabled
            activeOutlineColor="transparent"
            outlineColor="transparent"
            textColor={primaryColor}
            selectionColor={primaryColor}
          />
          <View style={{ marginTop: 16 }}>
            {loadingLocation
              ? (
                <ActivityIndicator
                  animating
                  style={styles.map}
                />
              )
              : (
                <MapView
                  style={styles.map}
                  provider={PROVIDER_GOOGLE}
                  region={mapRegion}
                  addressForCoordinate
                >
                  <Marker
                    coordinate={mapRegion}
                    title="marker"
                    draggable
                    onDragEnd={(e) => {
                      serUserPosition({
                        latitude: e.nativeEvent.coordinate.latitude,
                        longitude: e.nativeEvent.coordinate.longitude,
                      });
                    }}
                  />
                </MapView>
              )}
          </View>
        </View>
      </View>
      <View>
        <View style={styles.label}>
          <Text variant="labelLarge">
            Imágenes referenciales (opcional)
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {image && <Image source={{ uri: image.uri }} style={{ width: 200, height: 200 }} />}
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'center',
            ...styles.component,
          }}
        >
          <Button icon="file" onPress={selectImageFromFile}>
            Seleccionar imagen
          </Button>
          <Button icon="camera" onPress={selectImageFromCamera}>
            Tomar foto
          </Button>
        </View>
      </View>
      <View style={styles.component}>
        <Button
          mode="contained"
          loading={createServiceLoading}
          onPress={handleCreateService}
        >
          Publicar
        </Button>
      </View>
    </ScrollView>
  );
};

export default CreateService;
