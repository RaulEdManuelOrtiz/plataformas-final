import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Card, Divider, List, Text,
} from 'react-native-paper';
import {
  arrayUnion,
  collection, doc, getDoc, onSnapshot, query, updateDoc, where,
} from 'firebase/firestore';
import { primaryColor } from '../../Utils/constants';
import { MyContext } from '../../../App';
import { db } from '../../Firebase/config';
import UserCard from '../UserCard';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flexDirection: 'column',
    marginHorizontal: 25,
  },
  cardContainer: {
    paddingHorizontal: 25,
  },
  cardCover: {
    height: 140,
  },
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
    marginVertical: 28,
    marginHorizontal: 25,
  },
  loader: {
    height: '100%',
  },
});

const UserProfile = ({ navigation }) => {
  const [user, setUser, uiData, setUiData] = useContext(MyContext);
  const {
    userUid,
    applyingServiceId,
    serviceId,
  } = uiData;

  const [applyingServices, setApplyingServices] = useState();
  const [userData, setUserData] = useState();

  const getUserData = async () => {
    const docRef = doc(db, 'user', userUid);
    const docSnap = await getDoc(docRef);
    setUserData({
      id: docSnap.id,
      ...docSnap.data(),
    });
  };

  const getApplyingServicesQuery = query(
    collection(db, 'applyingService'),
    where('userUid', '==', userUid),
  );

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    const subscribe = onSnapshot(getApplyingServicesQuery, (snapshot) => {
      setApplyingServices(
        snapshot.docs.map((snapDoc) => { return { id: snapDoc.id, ...snapDoc.data() }; }),
      );
    });

    return () => {
      subscribe();
    };
  }, [user]);

  const [loadingContract, setLoadingContract] = useState(false);
  const handleContractApplyingService = async () => {
    setLoadingContract(true);
    const applyingServiceRef = doc(db, 'applyingService', applyingServiceId);

    await updateDoc(applyingServiceRef, {
      status: 'Acordado',
    });

    const serviceRef = doc(db, 'service', serviceId);

    await updateDoc(serviceRef, {
      status: 'Acordado',
    });
    setLoadingContract(false);
    navigation.goBack();
  };
  console.log(applyingServices);
  return (
    <View>
      <Card style={styles.cardContainer}>
        <Card.Cover style={styles.cardCover} source={{ uri: userData?.photoURL }} />
      </Card>
      <View style={styles.container}>
        <Text
          variant="headlineMedium"
          style={{
            color: primaryColor,
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: 16,
          }}
        >
          {userData?.name}
        </Text>
        <Text variant="bodyMedium" style={{ color: primaryColor, textAlign: 'center' }}>
          {userData?.email}
        </Text>
        <Text variant="bodyMedium" style={{ color: primaryColor, textAlign: 'center' }}>
          {userData?.phoneNumber}
        </Text>
      </View>
      <Divider style={{ marginHorizontal: 32, marginVertical: 16 }} />
      <View style={{ marginHorizontal: 32 }}>
        <Text variant="titleLarge" style={{ color: primaryColor }}>
          Reviews
        </Text>
      </View>
      <View>
        {applyingServices?.map((item) => {
          if (item.comment) {
            return (
              <UserCard
                key={item.id}
                item={item}
                    // displayStatus={false}
                uiData={uiData}
                setUiData={setUiData}
                isReview
              />
            );
          } return <View />;
        })}
      </View>
      <View style={styles.component}>
        <Button
          mode="contained"
          loading={loadingContract}
          onPress={handleContractApplyingService}
        >
          Contratar
        </Button>
      </View>
    </View>
  );
};

export default UserProfile;
