import { signInAnonymously } from 'firebase/auth'
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import type { MatchRoom } from './matchRooms'

const roomsCollection = collection(db, 'matchRooms')

function normalizeRoom(room: MatchRoom): MatchRoom {
  return {
    id: room.id,
    fixture: room.fixture,
    stage: room.stage,
    score: room.score,
    chase: room.chase,
    venue: room.venue,
    mood: room.mood,
    activeFans: room.activeFans,
    reactions: room.reactions,
    moments: room.moments,
    chat: room.chat,
  }
}

export async function ensureAuth() {
  if (auth.currentUser) {
    return auth.currentUser
  }

  const credential = await signInAnonymously(auth)
  return credential.user
}

export function subscribeToRooms(
  onData: (rooms: MatchRoom[]) => void,
  onError: (message: string) => void,
) {
  const roomQuery = query(roomsCollection, orderBy('fixture'))

  return onSnapshot(
    roomQuery,
    (snapshot) => {
      const rooms = snapshot.docs.map((roomDoc) => {
        const data = roomDoc.data() as Omit<MatchRoom, 'id'>
        return {
          id: roomDoc.id,
          ...data,
        }
      })

      onData(rooms)
    },
    (error) => {
      onError(error.message)
    },
  )
}

export async function persistRoom(room: MatchRoom) {
  await ensureAuth()
  await setDoc(doc(db, 'matchRooms', room.id), normalizeRoom(room), { merge: true })
}

export async function seedRoomsIfEmpty(seedRooms: MatchRoom[]) {
  await ensureAuth()
  const snapshot = await getDocs(roomsCollection)

  if (!snapshot.empty) {
    return
  }

  await Promise.all(seedRooms.map((room) => persistRoom(room)))
}
