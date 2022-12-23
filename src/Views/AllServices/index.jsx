import React, { useContext, useEffect, useState } from 'react';
import {
  View, StyleSheet, ScrollView, FlatList,
} from 'react-native';
import {
  ActivityIndicator,
  Avatar, Card, IconButton, Searchbar, SegmentedButtons, Text,
} from 'react-native-paper';
import {
  collection, query, where, onSnapshot,
} from 'firebase/firestore';
import auth from '@react-native-firebase/auth';
import { primaryColor } from '../../Utils/constants';
import { MyContext } from '../../../App';
import ServiceCard from '../../Components/ServiceCard';
import { getCategories } from '../../Firebase/utils';
import { db } from '../../Firebase/config';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    height: '94%',
    marginTop: 40,
  },
  userInfo: {
    marginBottom: 8,
    backgroundColor: 'white',
    borderStyle: undefined,
    borderColor: 'red',
    borderWidth: 0,
  },
  message: {
    fontWeight: '100',
    fontSize: 14,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    color: primaryColor,
  },
  search: {
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    borderRadius: 15,
  },
  searchLabel: {

  },
  safeAreaContainer: {
    flex: 1,
    // flex: 1,
    // alignItems: 'center',
    marginHorizontal: 16,
    // backgroundColor: 'red',
    // padding: 0,
    marginBottom: 10,
    height: 40,
  },
  segmentedButton: {
    // marginHorizontal: 1,
    height: 40,
    // marginLeft: -60,
    // backgroundColor: 'white',
    // backgroundColor: 'blue',
  },
  title: {
    marginHorizontal: 16,
    fontWeight: '700',
    color: primaryColor,
  },
  loader: {
    width: '100%',
    height: '55%',
  },
});

const message = (currentHour) => {
  if (currentHour < 12) {
    return 'Buenos dias!';
  } if (currentHour < 18) {
    return 'Buenas tardes!';
  }
  return 'Buenas noches!';
};

const AllServices = ({ navigation }) => {
  const [user, setUser, uiData, setUiData] = useContext(MyContext);
  const today = new Date();
  const currentHour = today.getHours();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [value, setValue] = React.useState('all');

  const [services, setServices] = useState();
  const [categories, setCategories] = useState([]);

  const [filteredServices, setFilteredServices] = useState();

  const getAllServicesQuery = query(
    collection(db, 'service'),
    where('userUid', '!=', user.uid),
  );

  const getData = async () => {
    await getCategories(setCategories);
  };

  useEffect(() => {
    const subscribe = onSnapshot(getAllServicesQuery, (snapshot) => {
      setServices(snapshot.docs.map((doc) => { return { id: doc.id, ...doc.data() }; }));
    });

    return () => {
      getData();
      subscribe();
    };
  }, [user]);

  useEffect(() => {
    setFilteredServices(services);
  }, [services]);

  const handleFilter = (filterValue, queryValue) => {
    if (filterValue === 'all') {
      setFilteredServices(
        services.filter((service) => { return service.title.includes(queryValue); }),
      );
    } else {
      setFilteredServices(
        services
          .filter((service) => {
            return service.title.includes(queryValue) && service.categoryId === filterValue;
          }),
      );
    }
  };

  const onChangeSearch = (query) => {
    setSearchQuery(query);
    handleFilter(value, query);
  };

  const handleChangeCategory = (newValue) => {
    setValue(newValue);
    handleFilter(newValue, searchQuery);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.userInfo} elevation={0} mode="contained">
        <Card.Title
          title={message(currentHour)}
          titleStyle={styles.message}
          subtitle={user.displayName}
          subtitleStyle={styles.name}
          // eslint-disable-next-line
          left={(props) => <Avatar.Image {...props} source={{ uri: user.photoURL }} />}
           // eslint-disable-next-line
         right={() => {return (
           <IconButton
             icon="logout"
             onPress={() => { auth().signOut(); }}
           />
         );
         }}
        />
      </Card>
      <Searchbar
        placeholder="Buscar"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.search}
        inputStyle={styles.searchLabel}
        placeholderTextColor="#BDBDBD"
        iconColor="#BDBDBD"
        elevation={0}
      />
      <View style={{ marginVertical: 12 }}>
        <Text variant="titleMedium" style={styles.title}>
          Servicios destacados
        </Text>
      </View>
      <View style={{ height: 56 }}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal
          style={styles.safeAreaContainer}
        >
          <SegmentedButtons
            value={value}
            onValueChange={handleChangeCategory}
            style={styles.segmentedButton}
            buttons={[
              {
                value: 'all',
                label: 'Todos',
                style: {
                  marginRight: 8,
                  borderColor: primaryColor,
                  borderRadius: 15,
                  borderWidth: 1,
                  borderRightWidth: 1,
                  borderBottomEndRadius: 15,
                  borderTopEndRadius: 15,
                },
              },
              ...categories.map((category, index) => {
                return {
                  value: category.id,
                  label: category.name,
                  style: {
                    ...index === category.length - 1 ? {
                      marginLeft: 8,
                    } : {
                      marginHorizontal: 8,
                    },
                    borderColor: primaryColor,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderRightWidth: 1,
                    borderBottomStartRadius: 15,
                    borderTopStartRadius: 15,
                  },
                };
              }),
            ]}
          />
        </ScrollView>
      </View>
      {filteredServices ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={filteredServices}
          style={styles.loader}
          renderItem={
            ({ item }) => {
              return (
                <ServiceCard
                  item={item}
                  navigation={navigation}
                  displayStatus={false}
                  uiData={uiData}
                  setUiData={setUiData}
                />
              );
            }
              }
        />
      )
        : (
          <ActivityIndicator
            animating
            style={styles.loader}
          />
        )}

    </View>
  );
};

export default AllServices;
