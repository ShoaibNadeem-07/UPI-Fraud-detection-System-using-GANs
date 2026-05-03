// Firebase Configuration for SafePayAI
// Replace with your Firebase project credentials
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

// Firebase configuration for fraudai-ccd33
const firebaseConfig = {
    apiKey: "AIzaSyC22XcAcZ8uyZ-blAGzBu8mvgHIf3vhyHc",
    authDomain: "fraudai-ccd33.firebaseapp.com",
    projectId: "fraudai-ccd33",
    storageBucket: "fraudai-ccd33.firebasestorage.app",
    messagingSenderId: "591899984060",
    appId: "1:591899984060:web:771f54af8d26145ddd10b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Sign in with Google
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Create or update user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            upiId: `${user.email.split('@')[0]}@safepay`,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
        }, { merge: true });

        return user;
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
};

// Sign out
export const signOutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
};

// Auth state observer
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// Get user data from Firestore
export const getUserData = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

// Save transaction to Firestore
export const saveTransaction = async (userId, transactionData) => {
    try {
        const docRef = await addDoc(collection(db, 'transactions'), {
            userId,
            ...transactionData,
            timestamp: new Date().toISOString()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving transaction:', error);
        throw error;
    }
};

// Get user transactions
export const getUserTransactions = async (userId) => {
    try {
        const q = query(collection(db, 'transactions'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const transactions = [];
        querySnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });
        return transactions;
    } catch (error) {
        console.error('Error getting transactions:', error);
        return [];
    }
};

// Update user location
export const updateUserLocation = async (uid, latitude, longitude) => {
    try {
        await setDoc(doc(db, 'users', uid), {
            lastLocation: { latitude, longitude },
            locationUpdatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        console.error('Error updating location:', error);
    }
};

export default app;
