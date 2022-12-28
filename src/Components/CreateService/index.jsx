import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  Image, ScrollView, StyleSheet, View,
} from 'react-native';
import {
  ActivityIndicator,
  Button, Chip, IconButton, Modal, Portal, Text, TextInput, TouchableRipple,
} from 'react-native-paper';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import {
  addDoc,
  collection, doc, getDoc, onSnapshot, query, Timestamp, updateDoc, arrayUnion, where,
} from 'firebase/firestore';
import {
  createServiceFunc, getCategories,
} from '../../Firebase/utils';
import { primaryColor } from '../../Utils/constants';
import { MyContext } from '../../../App';
import { db } from '../../Firebase/config';
import ServiceCard, { iconColor } from '../ServiceCard';
import UserCard from '../UserCard';

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
  loader: {
    height: '100%',
  },
});

const CreateService = ({ navigation }) => {
  const [createServiceLoading, setCreateServiceLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [user, setUser, uiData, setUiData] = useContext(MyContext);
  const [description, setDescription] = useState('');
  const [serviceName, setServiceName] = useState('');
  const {
    readOnly, serviceId, applying, applyingServiceId,
  } = uiData;
  const [categorySelected, setCategorySelected] = useState({});
  //
  const [userAddress, setUserAddress] = useState('');
  const [userPosition, serUserPosition] = useState();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // ReadOnly
  const [serviceData, setServiceData] = useState();

  const getData = async () => {
    await getCategories(setCategories);
  };

  useEffect(() => {
    const subscribe = onSnapshot(doc(db, 'service', serviceId || 'q'), (snapshot) => {
      setServiceData({ id: snapshot.id, ...snapshot.data() });
    });
    return () => {
      if (serviceId) {
        subscribe();
      }
    };
  }, []);

  useEffect(() => {
    getData();
  }, []);

  const [applyingServiceData, setApplyingServiceData] = useState();
  useEffect(() => {
    const subscribe = onSnapshot(doc(db, 'applyingService', applyingServiceId || 'q'), (snapshot) => {
      setApplyingServiceData({ id: snapshot.id, ...snapshot.data() });
    });
    return () => {
      if (applying) {
        subscribe();
      }
    };
  }, []);

  useEffect(() => {
    getData();
  }, []);

  const [image, setImage] = useState(null);

  useEffect(() => {
    if (readOnly && serviceData) {
      setCategorySelected({ id: serviceData.categoryId });
      setServiceName(serviceData.title);
      setDescription(serviceData.description);
      setUserAddress(serviceData.address);
      serUserPosition(
        { latitude: serviceData.latitude, longitude: serviceData.longitude },
      );
      setImage({ uri: serviceData.imageURL });
    }
  }, [serviceData]);

  const [mapRegion, setMapRegion] = useState();

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
      categoryId: categorySelected.id,
      categoryName: categorySelected.name,
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

  // APPLYING
  const [price, setPrice] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [createApplyingServiceLoading, setCreateApplyingServiceLoading] = useState(false);

  const handleApplyingService = async () => {
    setCreateApplyingServiceLoading(true);
    let userData = {};
    const docRef = doc(db, 'user', user.uid);
    const docSnap = await getDoc(docRef);
    userData = {
      id: docSnap.id,
      ...docSnap.data(),
    };

    const newApplyingService = await addDoc(collection(db, 'applyingService'), {
      userUid: user.uid,
      serviceId: serviceData.id,
      status: 'En evaluacion',
      price,
      created: Timestamp.now(),
      title: serviceData.title,
      address: serviceData.address,
      categoryName: serviceData.categoryName,
      imageURL: serviceData.imageURL,
      phoneNumber,
      ...userData,
    });
    const userRef = doc(db, 'user', user.uid);
    await updateDoc(userRef, {
      serviceApplyingIds: arrayUnion(newApplyingService.id),
      phoneNumber,
    });

    const serviceRef = doc(db, 'service', serviceData.id);
    await updateDoc(serviceRef, {
      status: 'Solicitado',
    });
    navigation.navigate('MyServices');
    setCreateApplyingServiceLoading(false);
  };

  const [applyingServices, setApplyingServices] = useState();
  const getApplyingServicesQuery = query(
    collection(db, 'applyingService'),
    where('serviceId', '==', serviceId || 'q'),
  );

  useEffect(() => {
    const subscribe = onSnapshot(getApplyingServicesQuery, (snapshot) => {
      setApplyingServices(
        snapshot.docs.map((snapDoc) => { return { ...snapDoc.data(), id: snapDoc.id }; }),
      );
    });

    return () => {
      subscribe();
    };
  }, [user]);

  const [completeServiceApplyingLoading, setCompleteServiceApplyingLoading] = useState(false);
  const handleCompleteServiceApplying = async () => {
    setCompleteServiceApplyingLoading(true);
    const applyingServiceRef = doc(db, 'applyingService', applyingServiceId);

    await updateDoc(applyingServiceRef, {
      status: 'Realizado',
    });

    const serviceRef = doc(db, 'service', serviceId);

    await updateDoc(serviceRef, {
      status: 'Realizado',
    });
    setCompleteServiceApplyingLoading(false);
    navigation.navigate('MyServices');
  };

  const [closedServiceApplyingLoading, setClosedServiceApplyingLoading] = useState(false);

  const [rates, setRates] = useState([
    {
      value: 'sdfvbc',
      label: 1,
    },
    {
      value: 'hjbn',
      label: 2,
    },
    {
      value: 'hjkyu',
      label: 3,
    },
    {
      value: 'wegfh',
      label: 4,
    },
    {
      value: 'ytuyu',
      label: 5,
    },
  ]);

  const [selectedRate, setSelectedRate] = useState({});
  const [comment, setComment] = useState('');
  const handleClosedServiceApplying = async () => {
    setClosedServiceApplyingLoading(true);
    const applyingServiceRef = doc(db, 'applyingService', applyingServiceId);

    await updateDoc(applyingServiceRef, {
      comment,
      selectedRate: selectedRate.label,
    });

    const serviceRef = doc(db, 'service', serviceId);

    await updateDoc(serviceRef, {
      status: 'Cerrado',
    });
    setClosedServiceApplyingLoading(false);
    navigation.navigate('MyServices');
  };

  return (
    <ScrollView style={styles.view}>
      {
        serviceData ? (
          <View>
            {applying && (
            <View>
              <View style={styles.label}>
                <Text variant="labelLarge">
                  Estado
                </Text>
              </View>
              <View style={styles.component}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginLeft: 10,
                  }}
                >
                  <IconButton
                    size={18}
                    style={{ marginLeft: -16 }}
                    iconColor={iconColor[applyingServiceData?.status]}
                    icon="checkbox-blank-circle"
                  />
                  <Text variant="bodyLarge" style={{ color: primaryColor }}>
                    {applyingServiceData?.status}
                  </Text>
                </View>
              </View>
            </View>
            )}
            <View>
              <View style={styles.label}>
                <Text variant="labelLarge">
                  Seleccione las categorías del servicio
                </Text>
              </View>
              <View style={{ flexDirection: 'row', ...styles.component }}>
                {categories?.map((category) => {
                  return (
                    <Chip
                      mode={categorySelected.id === category.id ? 'flat' : 'outlined'}
                      key={category.id}
                      style={{ marginRight: 10 }}
                      // eslint-disable-next-line
                      {...!readOnly && { onPress: () => { setCategorySelected(category); } }}
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
                  disabled={readOnly}
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
                  disabled={readOnly}
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
                          {...!readOnly && { draggable: true }}
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
              {!readOnly && (
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
              )}
            </View>
            { !readOnly && (
            <View style={styles.component}>
              <Button
                mode="contained"
                loading={createServiceLoading}
                onPress={handleCreateService}
              >
                Publicar
              </Button>
            </View>
            )}
            {(user.uid !== serviceData?.userUid && readOnly) && (
            <View style={{ marginTop: 32 }}>
              <View style={styles.label}>
                <Text variant="labelLarge">
                  {serviceData.status === ''}
                  Ingrese una cotización del servicio
                </Text>
              </View>
              <View style={styles.component}>
                <TextInput
                  mode="outlined"
                  value={price || applyingServiceData?.price || ''}
                  onChangeText={(text) => { return setPrice(text); }}
                  outlineStyle={{ borderRadius: 12 }}
                  style={styles.input}
                  theme={{ colors: { primary: primaryColor } }}
                  activeOutlineColor="transparent"
                  outlineColor="transparent"
                  textColor={primaryColor}
                  selectionColor={primaryColor}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.label}>
                <Text variant="labelLarge">
                  Ingrese una numero de contacto
                </Text>
              </View>
              <View style={styles.component}>
                <TextInput
                  mode="outlined"
                  value={phoneNumber || applyingServiceData?.phoneNumber || ''}
                  onChangeText={(text) => { return setPhoneNumber(text); }}
                  outlineStyle={{ borderRadius: 12 }}
                  style={styles.input}
                  theme={{ colors: { primary: primaryColor } }}
                  activeOutlineColor="transparent"
                  outlineColor="transparent"
                  textColor={primaryColor}
                  selectionColor={primaryColor}
                  keyboardType="number-pad"
                />
              </View>
              {!applying && (
              <View style={styles.component}>
                <Button
                  mode="contained"
                  loading={createApplyingServiceLoading}
                  onPress={handleApplyingService}
                >
                  Aplicar
                </Button>
              </View>
              )}
            </View>
            )}

          </View>
        ) : (
          <ActivityIndicator
            animating
            style={styles.loader}
          />
        )
        }
      {(serviceData?.status === 'Solicitado' && !applying)
          && (
          <View style={{ marginTop: 32 }}>
            <View style={styles.label}>
              <Text variant="labelLarge">
                Ofertas para el servicio
              </Text>
            </View>
            {applyingServices ? (
              applyingServices?.map((applyingItem) => {
                return (
                  <UserCard
                    key={applyingItem.id}
                    item={applyingItem}
                    navigation={navigation}
                        // displayStatus={false}
                    uiData={uiData}
                    setUiData={setUiData}
                  />
                );
              })
            )
              : (
                <ActivityIndicator
                  animating
                  style={styles.loader}
                />
              )}
          </View>
          )}
      {(serviceData?.status === 'Acordado' && !applying)
          && (
          <View style={{ marginTop: 32 }}>
            <View style={styles.label}>
              <Text variant="labelLarge">
                Contratado
              </Text>
            </View>
            {applyingServices ? (
              applyingServices?.map((applyingItem) => {
                return (
                  <UserCard
                    key={applyingItem.id}
                    item={applyingItem}
                    navigation={navigation}
                                  // displayStatus={false}
                    uiData={uiData}
                    setUiData={setUiData}
                    displayContact
                  />
                );
              })
            )
              : (
                <ActivityIndicator
                  animating
                  style={styles.loader}
                />
              )}
            <View style={{ ...styles.label, marginTop: 24 }}>
              <Text variant="labelLarge">
                Contacto
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
              <IconButton
                icon="cellphone"
                iconColor={primaryColor}
                size={36}
                // onPress={() => { Linking.openURL(`whatsapp://send?phone=${serviceData?.phoneNumber}`); }}
              />
              <IconButton
                icon="whatsapp"
                iconColor={primaryColor}
                size={36}
                // onPress={() => { Linking.openURL(`tel:${serviceData?.phoneNumber}`); }}
              />
              <IconButton
                icon="email"
                iconColor={primaryColor}
                size={36}
                // onPress={() => { Linking.openURL(`mailto:${serviceData?.email}`); }}
              />
              {/* {applyingServices[0]} */}
            </View>
          </View>
          )}
      { (serviceData?.status === 'Acordado' && applying) && (
      <View style={styles.component}>
        <Button
          mode="contained"
          loading={completeServiceApplyingLoading}
          onPress={handleCompleteServiceApplying}
        >
          Marcar como realizado
        </Button>
      </View>
      )}
      { (serviceData?.status === 'Realizado' && !applying) && (
      <View style={{ ...styles.component, marginTop: 32 }}>
        <View style={{ marginTop: 32 }}>
          <View style={styles.label}>
            <Text variant="labelLarge">
              Contratado
            </Text>
          </View>
          {applyingServices ? (
            applyingServices?.map((applyingItem) => {
              return (
                <UserCard
                  key={applyingItem.id}
                  item={applyingItem}
                  navigation={navigation}
                            // displayStatus={false}
                  uiData={uiData}
                  setUiData={setUiData}
                  displayContact
                />
              );
            })
          )
            : (
              <ActivityIndicator
                animating
                style={styles.loader}
              />
            )}
          <View style={{ ...styles.label, marginTop: 24 }}>
            <Text variant="labelLarge">
              Contacto
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
            <IconButton
              icon="cellphone"
              iconColor={primaryColor}
              size={36}
                // onPress={() => { auth().signOut(); }}
            />
            <IconButton
              icon="whatsapp"
              iconColor={primaryColor}
              size={36}
            />
            <IconButton
              icon="email"
              iconColor={primaryColor}
              size={36}
            />
            {/* {applyingServices[0]} */}
          </View>
        </View>
        <View style={styles.label}>
          <Text variant="labelLarge">
            Calificación del servicio
          </Text>
        </View>
        <View style={{ flexDirection: 'row', ...styles.component }}>
          {rates?.map((rate) => {
            return (
              <Chip
                mode={selectedRate.value === rate.value ? 'flat' : 'outlined'}
                key={rate.value}
                style={{ marginRight: 10 }}
                onPress={() => { setSelectedRate(rate); }}
              >
                {rate.label}
              </Chip>
            );
          })}
        </View>
        <View style={styles.label}>
          <Text variant="labelLarge">
            Comentario
          </Text>
        </View>
        <View>
          <TextInput
            mode="outlined"
            value={comment}
            onChangeText={(text) => { return setComment(text); }}
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
        <Button
          style={{ marginTop: 32 }}
          mode="contained"
          loading={closedServiceApplyingLoading}
          onPress={handleClosedServiceApplying}
        >
          Marcar como realizado
        </Button>
      </View>
      )}
    </ScrollView>
  );
};

export default CreateService;
