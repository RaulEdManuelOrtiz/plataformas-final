import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { primaryColor } from '../../Utils/constants';

const styles = StyleSheet.create({
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
});

const Header = ({
  title, iconSize = 36, onPress = null, icon,
}) => {
  return (
    <Card style={styles.viewTitle} elevation={0} mode="container">
      <Card.Title
        title={title}
        titleStyle={styles.title}
    // eslint-disable-next-line
    left={(props) => <IconButton
      size={iconSize}
      iconColor={primaryColor}
      icon={icon}
      {...onPress && { onPress }}
    />}
      />
    </Card>
  );
};

export default Header;
