import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAiuze0buWw9bqgGIQel8tL5VZdY_EvRWo',
  authDomain: 'storied-toolbox-493710-c7.firebaseapp.com',
  projectId: 'storied-toolbox-493710-c7',
  storageBucket: 'storied-toolbox-493710-c7.firebasestorage.app',
  messagingSenderId: '910538545875',
  appId: '1:910538545875:web:14057b11aec98d1c485226',
  measurementId: 'G-YC2CKS5MC6',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export const analyticsPromise: Promise<Analytics | null> =
  typeof window === 'undefined'
    ? Promise.resolve(null)
    : isSupported().then((supported) => (supported ? getAnalytics(app) : null))

export default app
