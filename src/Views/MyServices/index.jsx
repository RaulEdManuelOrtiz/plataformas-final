import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityIndicator, FAB, SegmentedButtons } from 'react-native-paper';
import Header from '../../Components/Header';
import { primaryColor } from '../../Utils/constants';
import { getMyServices } from '../../Firebase/utils';
import { MyContext } from '../../../App';
import ServiceCard from '../../Components/ServiceCard';

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
  const user = useContext(MyContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    getMyServices(user.uid, setServices)
      .then(() => {
        setLoading(false);
      });
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
      {value === 'one' && (
      <View>
          {loading ? (
            <ActivityIndicator
              animating
              style={styles.loader}
            />
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={services}
              style={styles.loader}
              renderItem={
                    ({ item }) => {
                      return <ServiceCard item={item} navigation={navigation} />;
                    }
                  }
            />
          )}
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => { return navigation.navigate('CreateService'); }}
        />
      </View>

      )}
    </View>
  );
};

export default MyServices;
