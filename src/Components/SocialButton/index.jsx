import React from 'react';
import { Button } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { primaryColor } from '../../Utils/constants';

export const types = {
  facebook: {
    icon: 'facebook',
    text: 'Iniciar sesión con Facebook',
  },
  google: {
    icon: 'google',
    text: 'Iniciar sesión con Google',
  },
  github: {
    icon: 'github',
    text: 'Iniciar sesión con Github',
  },
};

const styles = StyleSheet.create({
  button: {
    borderStyle: 'solid',
    borderColor: '#CCD4DA',
    marginBottom: 20,
  },
  buttonContentStyle: {
    height: 50,
  },
});
const SocialButton = ({ type, onClick }) => {
  const { icon, text } = types[type];

  return (
    <Button
      icon={icon}
      style={styles.button}
      onPress={onClick}
      textColor={primaryColor}
      mode="outlined"
      contentStyle={styles.buttonContentStyle}
    >
      {text}
    </Button>
  );
};

export default SocialButton;
