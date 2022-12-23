import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityIndicator, FAB, SegmentedButtons } from 'react-native-paper';
import {
  collection, onSnapshot, query, where, doc,
} from 'firebase/firestore';
import Header from '../../Components/Header';
import { primaryColor } from '../../Utils/constants';
import { getMyServices } from '../../Firebase/utils';
import { MyContext } from '../../../App';
import ServiceCard from '../../Components/ServiceCard';
import { db } from '../../Firebase/config';

const styles = StyleSheet.create({
  view: {
    paddingHorizontal: 25,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  viewTitle: {
    marginTop: 28,
    marginBottom: 0,
    backgroundColor: 'white',
    borderStyle: undefined,
    borderColor: 'red',
    borderWidth: 0,
    marginLeft: -10,
  },
  title: {
    fontWeight: '700',
    fontSize: 20,
    color: primaryColor,
    marginTop: 6,
    marginLeft: 6,
  },
  segmentedButton: {
    height: 40,
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  loader: {
    width: '100%',
    height: '76%',
  },
});

const MyServices = ({ navigation }) => {
  const [value, setValue] = React.useState('one');
  const [user, setUser, uiData, setUiData] = useContext(MyContext);
  const [services, setServices] = useState();
  const [loading, setLoading] = useState(false);

  const getMyServicesQuery = query(
    collection(db, 'service'),
    where('userUid', '==', user.uid),
  );

  useEffect(() => {
    const subscribe = onSnapshot(getMyServicesQuery, (snapshot) => {
      setServices(snapshot.docs.map((doc) => { return { id: doc.id, ...doc.data() }; }));
    });

    return () => {
      subscribe();
    };
  }, [user]);

  const [applyingServices, setApplyingServices] = useState();
  const getMyApplyingQuery = query(
    collection(db, 'applyingService'),
    where('userUid', '==', user.uid),
  );

  useEffect(() => {
    const subscribe = onSnapshot(getMyApplyingQuery, (snapshot) => {
      setApplyingServices(
        snapshot
          .docs
          .map((snapDoc) => { return { ...snapDoc.data(), id: snapDoc.id }; }),
      );
    });

    return () => {
      subscribe();
    };
  }, [user]);

  return (
    <View style={{ height: '100%' }}>
      <Header
        title="Mis servicios"
        icon="clipboard-list-outline"
      />
      <View>
        <SegmentedButtons
          value={value}
          onValueChange={setValue}
          style={styles.segmentedButton}
          buttons={[
            {
              value: 'one',
              label: 'Solicitados',
              style: {
                width: '50%',
                borderWidth: 0,
                borderBottomWidth: value === 'one' ? 3 : 0,
                borderColor: primaryColor,
                borderRadius: 0,
                backgroundColor: 'white',
              },
            },
            {
              value: 'two',
              label: 'Aplicados',
              style: {
                width: '50%',
                borderWidth: 0,
                borderBottomWidth: value === 'two' ? 3 : 0,
                borderColor: primaryColor,
                borderRadius: 0,
                backgroundColor: 'white',
              },
            },
          ]}
        />
      </View>
      {value === 'one' ? (
        <View>
          {services ? (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={services}
              style={styles.loader}
              renderItem={
                ({ item }) => {
                  return (
                    <ServiceCard
                      item={item}
                      navigation={navigation}
                      uiData={uiData}
                      setUiData={setUiData}
                    />
                  );
                }
              }
            />
          ) : (
            <ActivityIndicator
              animating
              style={styles.loader}
            />
          )}
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => {
              setUiData({
                ...uiData,
                readOnly: false,
                applying: false,
              });
              navigation.navigate('CreateService');
            }}
          />
        </View>
      ) : (
        <View>
          {applyingServices ? (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={applyingServices}
              style={styles.loader}
              renderItem={
                ({ item }) => {
                  return (
                    <ServiceCard
                      item={item}
                      navigation={navigation}
                      uiData={uiData}
                      setUiData={setUiData}
                      applying
                    />
                  );
                }
            }
            />
          ) : (
            <ActivityIndicator
              animating
              style={styles.loader}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default MyServices;
