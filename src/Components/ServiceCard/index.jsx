import React from 'react';
import {
  TouchableRipple, List, Text, Chip, IconButton,
} from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { primaryColor } from '../../Utils/constants';

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
    // height: 30,
  },
});

const iconColor = {
  Creado: 'green',
  Solicitado: 'green',
  Acordado: 'blue',
  Cerrado: 'red',
};
const ServiceCard = ({ navigation, item, displayStatus = true }) => {
  return (
    <TouchableRipple
      rippleColor="rgba(0, 0, 0, .32)"
      onPress={() => { navigation.navigate('CreateService'); }}
      style={{ borderRadius: 15 }}
    >
      <View style={styles.container}>
        <List.Image
          variant="image"
          style={{ height: 150, borderRadius: 10, width: 100 }}
          source={{ uri: item.imageURL }}
        />
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={{ color: primaryColor, fontWeight: 'bold' }}>
            {item.title}
          </Text>
          <Text variant="bodySmall" style={{ color: primaryColor }}>
            {item.address}
          </Text>
          {displayStatus ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <IconButton
                size={10}
                style={{ marginLeft: -6, marginRight: -2 }}
                iconColor={iconColor[item.status]}
                icon="checkbox-blank-circle"
              />
              <Text variant="bodySmall" style={{ color: primaryColor }}>
                {item.status}
              </Text>
            </View>
          ) : (
            <View style={styles.categoriesContainer}>
              <Chip mode="outlined" compact style={styles.chip}>{item.category}</Chip>
            </View>
          )}
        </View>
      </View>
    </TouchableRipple>
  );
};

export default ServiceCard;
