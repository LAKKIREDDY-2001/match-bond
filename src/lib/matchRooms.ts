export type Reaction = {
  id: string
  emoji: string
  label: string
  count: number
}

export type EmojiSignal = {
  emoji: string
  label: string
  text: string
}

export type ChatMessage = {
  id: string
  author: string
  tribe: string
  time: string
  text: string
}

export type MatchMoment = {
  id: string
  over: string
  title: string
  summary: string
  prompt: string
}

export type MatchRoom = {
  id: string
  fixture: string
  stage: string
  score: string
  chase: string
  venue: string
  mood: string
  activeFans: number
  reactions: Reaction[]
  moments: MatchMoment[]
  chat: ChatMessage[]
}

export const cricketSignals: EmojiSignal[] = [
  { emoji: '🏏', label: 'Shot', text: 'That bat flow was pure class 🏏' },
  { emoji: '🔥', label: 'Heat', text: 'Momentum swing. Crowd is on fire 🔥' },
  { emoji: '😱', label: 'Drama', text: 'No way that just happened 😱' },
  { emoji: '🙌', label: 'Belief', text: 'Back the team. We are still alive 🙌' },
  { emoji: '💙', label: 'Bond', text: 'Love this fan room energy tonight 💙' },
  { emoji: '🚨', label: 'Appeal', text: 'Massive appeal. Need the replay now 🚨' },
  { emoji: '6️⃣', label: 'Six', text: 'That deserved a stadium-wide six alert 6️⃣' },
  { emoji: '🎯', label: 'Yorker', text: 'Perfect execution. Absolute yorker 🎯' },
]

export const quickChants = [
  'Howzzat energy right now',
  'One wicket changes everything',
  'This over decides the chase',
  'Send this to the highlights reel',
]

export const demoRooms: MatchRoom[] = [
  {
    id: 'ipl-room',
    fixture: 'RCB vs DC',
    stage: 'LIVE · 18.2 overs',
    score: '174/5',
    chase: 'Need 18 from 10 balls',
    venue: 'M. Chinnaswamy Stadium',
    mood: 'Death-over chaos',
    activeFans: 3841,
    reactions: [
      { id: 'rx1', emoji: '6️⃣', label: 'Sixer roar', count: 512 },
      { id: 'rx2', emoji: '🚨', label: 'Howzzat', count: 238 },
      { id: 'rx3', emoji: '🔥', label: 'Pressure', count: 401 },
      { id: 'rx4', emoji: '🎯', label: 'Yorker love', count: 289 },
    ],
    moments: [
      {
        id: 'mo1',
        over: '18.1',
        title: 'Full toss punished over midwicket',
        summary: 'One missed yorker brought the dugout and the room to life in the same breath.',
        prompt: 'Should the bowler stay wide yorker or attack the stumps now?',
      },
      {
        id: 'mo2',
        over: '17.4',
        title: 'Direct-hit run out flips the pressure',
        summary: 'The chase froze for a moment and every fan room split between belief and panic.',
        prompt: 'Was that the real turning point of the match?',
      },
      {
        id: 'mo3',
        over: '15.6',
        title: 'Rookie batter survives a review',
        summary: 'A nerve-heavy DRS call created instant drama and three new debate threads.',
        prompt: 'Would you have reviewed that if you were captain?',
      },
    ],
    chat: [
      {
        id: 'ch1',
        author: 'Aarav',
        tribe: 'Chargers',
        time: '18.2',
        text: 'The crowd is reading every slower ball now. One clean swing and this explodes.',
      },
      {
        id: 'ch2',
        author: 'Diya',
        tribe: 'Meteors',
        time: '18.1',
        text: 'No panic. Nail the yorker and drag this to the last ball.',
      },
      {
        id: 'ch3',
        author: 'Noah',
        tribe: 'Neutral',
        time: '17.5',
        text: 'This is the exact kind of finish that needs instant emoji lanes and quick chants.',
      },
    ],
  },
  {
    id: 'worldcup-room',
    fixture: 'India vs Australia',
    stage: 'RECENT · Innings break',
    score: '296/7',
    chase: 'Australia need 297 from 50 overs',
    venue: 'Ahmedabad',
    mood: 'Strategic buzz',
    activeFans: 2518,
    reactions: [
      { id: 'rx5', emoji: '🏏', label: 'Cover drive', count: 610 },
      { id: 'rx6', emoji: '🧠', label: 'Captaincy', count: 187 },
      { id: 'rx7', emoji: '💥', label: 'Momentum', count: 344 },
      { id: 'rx8', emoji: '👏', label: 'Respect', count: 271 },
    ],
    moments: [
      {
        id: 'mo4',
        over: '46.2',
        title: 'Late surge resets the total',
        summary: 'The finishing burst changed the tone from defendable to dangerous.',
        prompt: 'Is 296 a par score or did India steal 20 extra here?',
      },
      {
        id: 'mo5',
        over: '28.5',
        title: 'Partnership absorbs the middle-over squeeze',
        summary: 'Fans used the room to explain run-rate pressure to newer viewers in real time.',
        prompt: 'Which batter controlled the tempo better through the quiet overs?',
      },
    ],
    chat: [
      {
        id: 'ch4',
        author: 'Ishita',
        tribe: 'India',
        time: 'Break',
        text: 'That finish changed the mood of the whole innings. 296 feels bigger than the scorecard says.',
      },
      {
        id: 'ch5',
        author: 'Ethan',
        tribe: 'Australia',
        time: 'Break',
        text: 'Powerplay will decide this chase. If we start well the room flips fast.',
      },
    ],
  },
]
