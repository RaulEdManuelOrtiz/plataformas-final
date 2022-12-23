import {
  collection, addDoc, query, orderBy, onSnapshot, Timestamp, where, getDocs, getDoc, doc,
} from 'firebase/firestore';
import {
  getStorage, ref, uploadBytesResumable, getDownloadURL,
} from 'firebase/storage';
import { db, storage } from './config';

export const getCategories = (setCategories) => {
  const q = query(collection(db, 'category'));
  onSnapshot(q, (querySnapshot) => {
    setCategories(querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        name: doc.data().name,
      };
    }));
  });
};

export const createServiceFunc = async ({
  categoryId,
  categoryName,
  description,
  title,
  image,
  latitude,
  longitude,
  address,
  status,
  setLoading,
  userUid,
}) => {
  if (image) {
    const blobImage = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', image.uri, true);
      xhr.send(null);
    });

    const metadata = {
      contentType: 'image/jpeg',
    };

    const storageRef = ref(storage, `${userUid}/${Math.random().toString(36).slice(2)}`);
    const uploadTask = uploadBytesResumable(storageRef, blobImage, metadata);

    uploadTask.on(
      'state_changed',
      () => {
      },
      () => {
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          addDoc(collection(db, 'service'), {
            categoryId,
            categoryName,
            description,
            title,
            imageURL: downloadURL,
            latitude,
            longitude,
            address,
            status,
            userUid,
            created: Timestamp.now(),
          })
            .then(() => {
              setLoading(false);
            });
        });
      },
    );
  } else {
    addDoc(collection(db, 'service'), {
      categoryId,
      description,
      title,
      latitude,
      longitude,
      address,
      status,
      userUid,
      created: Timestamp.now(),
    })
      .then(() => {
        setLoading(false);
      });
  }
};

const getAllServicesQuery = (userUid) => {
  return query(
    collection(db, 'service'),
    where('userUid', '!=', userUid),
  );
};

export const getAllServices = async (userUid, setServices) => {
  console.log;
  const myServicesArray = [];
  const q = query(
    collection(db, 'service'),
    where('userUid', '!=', userUid),
  );

  onSnapshot();
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((document) => {
    myServicesArray.push({
      id: document.id,
      ...document.data(),
    });
  });
  setServices(myServicesArray);
};

export const getMyServices = async (userUid, setServices) => {
  const myServicesArray = [];
  const q = query(
    collection(db, 'service'),
    where('userUid', '==', userUid),
  );
  const querySnapshot = await getDocs(q);

  // await Promise.all(querySnapshot.docs.map(async (document) => {
  //   const docRef = doc(db, 'category', document.data().categoryId);
  //   const docSnap = await getDoc(docRef);
  //   myServicesArray.push({
  //     id: document.id,
  //     ...document.data(),
  //     category: docSnap.data().name,
  //   });
  // }));
  querySnapshot.forEach((document) => {
    myServicesArray.push({
      id: document.id,
      ...document.data(),
    });
  });

  setServices(myServicesArray);
};
