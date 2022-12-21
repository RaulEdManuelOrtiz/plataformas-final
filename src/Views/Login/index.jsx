import React from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { Button } from 'react-native-paper';

const Login = () => {
  GoogleSignin.configure({
    webClientId: '221357654076-b0v66jcjt4jvm14r1eksijkrtekj1lap.apps.googleusercontent.com',
  });
  const onGoogleButtonPress = async () => {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    const userSignIn = auth().signInWithCredential(googleCredential);

    userSignIn
      .then((user) => {
        // navigation.navigate('Root');
      })
      .catch((e) => { return console.log(e); });
  };
  return (
    <Button onPress={onGoogleButtonPress}>
      TEST
    </Button>
  );
};

export default Login;
