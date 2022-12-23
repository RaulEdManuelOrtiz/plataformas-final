import React from 'react';
import {
  IconButton, List, Text, TouchableRipple,
} from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { primaryColor } from '../../Utils/constants';
import { iconColor } from '../ServiceCard';

const styles = StyleSheet.create({
  container: {
    marginBottom: 1,
    paddingVertical: 24,
    marginHorizontal: 16,
    borderBottomColor: '#BDBDBD',
    borderStyle: 'solid',
    borderBottomWidth: 0.5,
    flex: 1,
    flexDirection: 'row',
    borderRadius: 15,
  },
  textContainer: {
    flexDirection: 'column',
    marginLeft: 15,
    marginTop: -7,
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  chip: {
    marginTop: 8,
    // height: 30,
    backgroundColor: '#F5F5F5',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: primaryColor,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  chipText: {
    fontSize: 13,
    color: primaryColor,
  },
});

const UserCard = ({
  navigation, item, uiData, setUiData,
  isReview = false, displayContact = false,
}) => {
  console.log('ITEM: ', item);
  return (
    <TouchableRipple
      {...(!isReview && !displayContact) && {
        rippleColor: 'rgba(0, 0, 0, .32)',
        onPress: () => {
          setUiData({
            userUid: item.userUid,
            applyingServiceId: item.id,
            serviceId: item.serviceId,
          });
          navigation.navigate('UserProfile');
        },
      }}
      style={{ borderRadius: 15 }}
    >
      <View style={styles.container}>
        <List.Image
          variant="image"
          style={{ height: 150, borderRadius: 10, width: 100 }}
          source={{ uri: item.photoURL }}
        />
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={{ color: primaryColor, fontWeight: 'bold' }}>
            {item.name}
          </Text>
          <Text variant="bodyLarge" style={{ color: primaryColor }}>
            {(isReview && !displayContact) ? item.comment : `Cotización: S/.${item.price}`}
          </Text>
          {!isReview && (
          <Text variant="bodySmall" style={{ color: primaryColor }}>
            {`Ultima conexion: ${item.lastConnect}`}
          </Text>
          )}
        </View>
      </View>
    </TouchableRipple>
  );
};

export default UserCard;
