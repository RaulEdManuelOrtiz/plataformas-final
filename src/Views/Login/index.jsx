import React from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { Button } from 'react-native-paper';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../Firebase/config';

const Login = () => {
  GoogleSignin.configure({
    webClientId: '221357654076-b0v66jcjt4jvm14r1eksijkrtekj1lap.apps.googleusercontent.com',
  });
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
    <Button onPress={onGoogleButtonPress}>
      TEST
    </Button>
  );
};

export default Login;
