import React from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { Text } from 'react-native-paper';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { FacebookAuthProvider, getAuth, signInWithCredential } from '@firebase/auth';
import { View, StyleSheet } from 'react-native';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';
import { db } from '../../Firebase/config';
import SocialButton from '../../Components/SocialButton';

const styles = StyleSheet.create({
  view: {
    paddingHorizontal: 25,
  },
  container: {
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    marginTop: 150,
    marginBottom: 50,
  },
});
const Login = () => {
  GoogleSignin.configure({
    webClientId: '221357654076-b0v66jcjt4jvm14r1eksijkrtekj1lap.apps.googleusercontent.com',
  });

  const signInWithFB = async () => {
    try {
      await LoginManager.logInWithPermissions(['public_profile', 'email']);
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        return;
      }
      const facebookCredential = FacebookAuthProvider.credential(data.accessToken);
      const authF = getAuth();
      const response = await signInWithCredential(authF, facebookCredential);
    } catch (e) {
      console.log(e);
    }
  };

  const onGoogleButtonPress = async () => {
    await GoogleSignin.hasPlayServices();
    const { idToken } = await GoogleSignin.signIn();

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    const userSignIn = auth().signInWithCredential(googleCredential);

    userSignIn
      .then((user) => {
        const ref = doc(db, 'user', user.user.uid);
        setDoc(ref, {
          lastConnect: Timestamp.now(),
          photoURL: user.user.photoURL,
          name: user.user.displayName,
          email: user.user.email,
        }, { merge: true });
      })
      .catch((e) => { return console.log(e); });
  };

  return (
    <View style={styles.view}>
      <View style={styles.container}>
        <Text variant="headlineLarge">
          Bienvenido
        </Text>
      </View>
      <SocialButton type="facebook" onClick={signInWithFB} />
      <SocialButton type="google" onClick={onGoogleButtonPress} />
      <SocialButton type="github" onClick={() => {}} />
    </View>

  );
};

export default Login;
