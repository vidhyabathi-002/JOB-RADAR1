import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp, where } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string, role: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  
  const newUser = {
    id: res.user.uid,
    name: name,
    email: email,
    role: role,
    skills: [],
    savedJobs: [],
    avatar: `https://picsum.photos/seed/${res.user.uid}/100/100`,
    createdAt: serverTimestamp(),
    profileStrength: 1
  };
  await setDoc(doc(db, 'users', res.user.uid), newUser);
  
  // Return the user so the caller knows signup was successful
  // We no longer signOut(auth) here to allow immediate login state
  return res.user;
};

export const loginWithEmail = async (email: string, pass: string) => {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  return res.user;
};

export const logout = () => signOut(auth);

// Helper to handle Firestore user profile
export const syncUserProfile = async (firebaseUser: any, role: string = 'JOB_SEEKER') => {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    const newUser = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'Anonymous User',
      email: firebaseUser.email,
      role: role,
      skills: [],
      savedJobs: [],
      avatar: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
      createdAt: serverTimestamp(),
      profileStrength: 1
    };
    await setDoc(userDocRef, newUser);
    return newUser;
  }
  return userDoc.data();
};
