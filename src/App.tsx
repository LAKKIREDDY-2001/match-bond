import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, Sparkles, Stars } from '@react-three/drei'
import type { Mesh } from 'three'
import { ensureAuth, persistRoom, seedRoomsIfEmpty, subscribeToRooms } from './lib/matchBondStore'
import { cricketSignals, demoRooms, quickChants, type MatchRoom } from './lib/matchRooms'
import { fetchFantasySummary } from './lib/cricApi'
import './App.css'

function SpinningBall() {
  const ballRef = useRef<Mesh>(null)
  const seamRef = useRef<Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (ballRef.current) {
      ballRef.current.rotation.x = t * 1.6
      ballRef.current.rotation.y = t * 0.9
      ballRef.current.position.y = Math.sin(t * 1.5) * 0.18
    }

    if (seamRef.current) {
      seamRef.current.rotation.x = Math.PI / 2
      seamRef.current.rotation.y = t * 1.6
    }
  })

  return (
    <Float speed={2.2} rotationIntensity={0.4} floatIntensity={0.8}>
      <group>
        <mesh ref={ballRef} castShadow>
          <sphereGeometry args={[1.15, 64, 64]} />
          <meshStandardMaterial color="#c83d20" metalness={0.18} roughness={0.44} />
        </mesh>
        <mesh ref={seamRef}>
          <torusGeometry args={[0.72, 0.06, 16, 100]} />
          <meshStandardMaterial color="#f4e6d7" metalness={0.08} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  )
}

function StadiumBands() {
  const groupRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.08
    }
  })

  return (
    <mesh ref={groupRef} rotation-x={Math.PI / 2}>
      <torusGeometry args={[2.45, 0.16, 32, 120]} />
      <meshStandardMaterial color="#ffd46b" emissive="#d68916" emissiveIntensity={0.35} />
    </mesh>
  )
}

function StadiumScene() {
  return (
    <Canvas camera={{ position: [0, 1.8, 5.8], fov: 48 }} shadows>
      <color attach="background" args={['#081521']} />
      <fog attach="fog" args={['#081521', 6, 12]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} castShadow />
      <pointLight position={[-4, 2, 2]} color="#4ad4ff" intensity={18} distance={10} />
      <pointLight position={[4, 2, -1]} color="#ffc857" intensity={12} distance={10} />

      <mesh rotation-x={-Math.PI / 2} position={[0, -1.55, 0]} receiveShadow>
        <circleGeometry args={[3.15, 64]} />
        <meshStandardMaterial color="#0c5f39" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.48, 0]}>
        <ringGeometry args={[0.56, 2.55, 64]} />
        <meshStandardMaterial color="#a7d98f" roughness={0.7} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.47, 0]}>
        <planeGeometry args={[0.65, 3.2]} />
        <meshStandardMaterial color="#d9bc88" roughness={1} />
      </mesh>

      <mesh position={[-0.18, -0.55, 0]}>
        <boxGeometry args={[0.07, 1.15, 0.07]} />
        <meshStandardMaterial color="#f5dcc0" />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[0.07, 1.15, 0.07]} />
        <meshStandardMaterial color="#f5dcc0" />
      </mesh>
      <mesh position={[0.18, -0.55, 0]}>
        <boxGeometry args={[0.07, 1.15, 0.07]} />
        <meshStandardMaterial color="#f5dcc0" />
      </mesh>

      <StadiumBands />
      <SpinningBall />
      <Sparkles count={120} scale={[9, 4, 9]} size={3} speed={0.5} color="#ffda6b" />
      <Stars radius={25} depth={18} count={1600} factor={2.6} saturation={0.2} fade />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.6} />
    </Canvas>
  )
}

function App() {
  const [rooms, setRooms] = useState<MatchRoom[]>(demoRooms)
  const [selectedRoomId, setSelectedRoomId] = useState(demoRooms[0].id)
  const [selectedMomentId, setSelectedMomentId] = useState(demoRooms[0].moments[0].id)
  const [draftMessage, setDraftMessage] = useState('We are one over away from chaos ')
  const [dataSource, setDataSource] = useState('Firebase live rooms')
  const [statusMessage, setStatusMessage] = useState<string | null>('Connecting to Firebase...')
  const [liveStageDraft, setLiveStageDraft] = useState(demoRooms[0].stage)
  const [liveScoreDraft, setLiveScoreDraft] = useState(demoRooms[0].score)
  const [liveChaseDraft, setLiveChaseDraft] = useState(demoRooms[0].chase)
  const [liveMoodDraft, setLiveMoodDraft] = useState(demoRooms[0].mood)
  const [momentOverDraft, setMomentOverDraft] = useState('19.1')
  const [momentTitleDraft, setMomentTitleDraft] = useState('New wicket shifts the chase')
  const [momentSummaryDraft, setMomentSummaryDraft] = useState('The latest ball changed the whole room mood and sparked instant reaction.')
  const [momentPromptDraft, setMomentPromptDraft] = useState('Does the batting side still control this finish?')
  const [cricApiMatchId, setCricApiMatchId] = useState('')
  const [cricApiKey, setCricApiKey] = useState('')
  const [isFetchingCricApi, setIsFetchingCricApi] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function connectFirebase() {
      try {
        await ensureAuth()
        await seedRoomsIfEmpty(demoRooms)

        if (!cancelled) {
          setStatusMessage('Anonymous Firebase session active.')
        }
      } catch (error) {
        if (!cancelled) {
          setDataSource('Local fallback mode')
          setStatusMessage('Using local fallback (Firebase Auth disabled in console).')
          // Initialize with demo data locally if Firebase fails
          setRooms(demoRooms)
        }
      }
    }

    void connectFirebase()

    const unsubscribe = subscribeToRooms(
      (nextRooms) => {
        if (!nextRooms.length || cancelled) {
          return
        }

        setRooms(nextRooms)
        setDataSource('Firebase Firestore live rooms')
        setStatusMessage('Live rooms synced from Firestore.')
      },
      (message) => {
        if (!cancelled) {
          setDataSource('Local fallback mode')
          setStatusMessage(`Firestore listener issue: ${message}`)
        }
      },
    )

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? rooms[0],
    [rooms, selectedRoomId],
  )

  const selectedMoment = useMemo(
    () =>
      selectedRoom?.moments.find((moment) => moment.id === selectedMomentId) ??
      selectedRoom?.moments[0],
    [selectedMomentId, selectedRoom],
  )

  const reactionTotal = selectedRoom?.reactions.reduce((sum, reaction) => sum + reaction.count, 0) ?? 0

  useEffect(() => {
    if (!selectedRoom) {
      return
    }

    setLiveStageDraft(selectedRoom.stage)
    setLiveScoreDraft(selectedRoom.score)
    setLiveChaseDraft(selectedRoom.chase)
    setLiveMoodDraft(selectedRoom.mood)
  }, [selectedRoom])

  function updateRoom(mutator: (room: MatchRoom) => MatchRoom) {
    if (!selectedRoom) {
      return
    }

    let nextRoom: MatchRoom | null = null

    setRooms((current) =>
      current.map((room) => {
        if (room.id !== selectedRoom.id) {
          return room
        }

        nextRoom = mutator(room)
        return nextRoom
      }),
    )

    if (nextRoom && dataSource !== 'Local fallback mode') {
      void persistRoom(nextRoom).catch((error) => {
        setStatusMessage(
          error instanceof Error ? `Firebase update failed: ${error.message}` : 'Firebase update failed.',
        )
      })
    }
  }

  function handleReaction(reactionId: string) {
    updateRoom((room) => ({
      ...room,
      reactions: room.reactions.map((reaction) =>
        reaction.id === reactionId ? { ...reaction, count: reaction.count + 1 } : reaction,
      ),
    }))
  }

  function addSignal(emoji: string) {
    setDraftMessage((current) => `${current}${current.endsWith(' ') || current === '' ? '' : ' '}${emoji} `)
  }

  function handleSendMessage(messageText: string) {
    const text = messageText.trim()

    if (!text || !selectedRoom) {
      return
    }

    updateRoom((room) => ({
      ...room,
      chat: [
        {
          id: `chat-${Date.now()}`,
          author: 'You',
          tribe: 'Match Bond',
          time: room.stage.includes('LIVE') ? 'Now' : 'Post',
          text,
        },
        ...room.chat,
      ],
    }))

    setDraftMessage('')
  }

  function handleLiveScoreUpdate() {
    updateRoom((room) => ({
      ...room,
      stage: liveStageDraft.trim() || room.stage,
      score: liveScoreDraft.trim() || room.score,
      chase: liveChaseDraft.trim() || room.chase,
      mood: liveMoodDraft.trim() || room.mood,
    }))
    setStatusMessage('Live scoreboard updated.')
  }

  async function handleFetchCricApi() {
    if (!cricApiMatchId.trim()) {
      setStatusMessage('Please enter a CricAPI Match ID.')
      return
    }
    if (!cricApiKey.trim()) {
      setStatusMessage('Please enter a CricAPI Key.')
      return
    }

    setIsFetchingCricApi(true)
    setStatusMessage('Fetching live data from CricAPI...')

    try {
      const result = await fetchFantasySummary(cricApiMatchId.trim(), cricApiKey.trim())
      if (result && 'error' in result) {
        setStatusMessage(`CricAPI Error: ${result.error}`)
        return
      }
      
      if (result && result.data) {
        // Extract basic data to set the score and stage
        // Format of result is complex, we will try to make a basic summary if available
        let newScore = liveScoreDraft
        let newStage = liveStageDraft

        if (result.data.batting && result.data.batting.length > 0) {
           const latestInning = result.data.batting[result.data.batting.length - 1]
           newStage = latestInning.title || 'Live Match'
           
           // Calculate total runs and wickets for this inning
           let totalRuns = 0
           let totalWickets = 0
           if (latestInning.scores && latestInning.scores[0]) {
             latestInning.scores[0].forEach(batsman => {
                if (batsman.R && !isNaN(parseInt(batsman.R))) {
                  totalRuns += parseInt(batsman.R)
                }
                if (batsman['dismissal-info'] && batsman['dismissal-info'].toLowerCase() !== 'not out' && batsman['dismissal-info'] !== '') {
                  totalWickets++
                }
             })
           }
           if (totalRuns > 0) {
             newScore = `${totalRuns}/${totalWickets}`
           }
        }
        
        setLiveStageDraft(newStage)
        setLiveScoreDraft(newScore)
        setStatusMessage('CricAPI data fetched and drafted!')
      } else {
         setStatusMessage('Failed to fetch valid data from CricAPI.')
      }
    } catch (err) {
      setStatusMessage('Error fetching from CricAPI.')
    } finally {
      setIsFetchingCricApi(false)
    }
  }

  function handlePushMoment() {
    const over = momentOverDraft.trim()
    const title = momentTitleDraft.trim()
    const summary = momentSummaryDraft.trim()
    const prompt = momentPromptDraft.trim()

    if (!over || !title || !summary || !prompt) {
      setStatusMessage('Fill all live moment fields before pushing an update.')
      return
    }

    const nextMomentId = `moment-${Date.now()}`

    updateRoom((room) => ({
      ...room,
      moments: [
        {
          id: nextMomentId,
          over,
          title,
          summary,
          prompt,
        },
        ...room.moments,
      ],
    }))

    setSelectedMomentId(nextMomentId)
    setStatusMessage('New live match moment pushed to the room.')
  }

  if (!selectedRoom || !selectedMoment) {
    return null
  }

  return (
    <main className="page-shell">
      <section className="hero-shell">
        <div className="hero-copy-card">
          <div className="eyebrow-row">
            <span className="eyebrow">Match Bond 3D</span>
            <span className="hero-pill">{selectedRoom.mood}</span>
          </div>
          <h1>Cricket rooms with 3D stadium energy, Firebase chat, and live reactions.</h1>
          <p className="hero-copy-text">
            This version runs on Google-backed services only. Firestore stores rooms,
            reactions, and messages, while Firebase Auth creates a lightweight anonymous
            session so fans can join fast.
          </p>
          <div className="hero-metrics">
            <article>
              <span>Live fans</span>
              <strong>{selectedRoom.activeFans}</strong>
            </article>
            <article>
              <span>Reaction burst</span>
              <strong>{reactionTotal}</strong>
            </article>
            <article>
              <span>Current chase</span>
              <strong>{selectedRoom.chase}</strong>
            </article>
          </div>
          <div className="data-source-banner">
            <span>{dataSource}</span>
            {statusMessage ? <strong>{statusMessage}</strong> : null}
          </div>
        </div>

        <div className="scene-card">
          <div className="scene-meta">
            <span>{selectedRoom.stage}</span>
            <strong>{selectedRoom.fixture}</strong>
            <p>{selectedRoom.score}</p>
          </div>
          <div className="scene-wrap">
            <StadiumScene />
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <aside className="panel room-panel">
          <div className="panel-heading">
            <span className="eyebrow">Cricket rooms</span>
            <h2>Pick the match</h2>
          </div>
          <div className="room-list">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                className={room.id === selectedRoom.id ? 'room-card active' : 'room-card'}
                onClick={() => {
                  setSelectedRoomId(room.id)
                  setSelectedMomentId(room.moments[0].id)
                }}
              >
                <span>{room.stage}</span>
                <strong>{room.fixture}</strong>
                <p>{room.chase}</p>
                <small>{room.venue}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="match-command">
          <div className="panel match-overview">
            <div>
              <span className="chip">{selectedRoom.stage}</span>
              <h2>{selectedRoom.fixture}</h2>
              <p>{selectedRoom.venue}</p>
            </div>
            <div className="overview-grid">
              <article>
                <span>Score</span>
                <strong>{selectedRoom.score}</strong>
              </article>
              <article>
                <span>Equation</span>
                <strong>{selectedRoom.chase}</strong>
              </article>
              <article>
                <span>Room mood</span>
                <strong>{selectedRoom.mood}</strong>
              </article>
              <article>
                <span>Active fans</span>
                <strong>{selectedRoom.activeFans}</strong>
              </article>
            </div>
          </div>

          <div className="live-grid">
            <section className="panel">
              <div className="subpanel-heading">
                <h3>Over-by-over sparks</h3>
                <span>{selectedRoom.moments.length} key moments</span>
              </div>
              <div className="moment-list">
                {selectedRoom.moments.map((moment) => (
                  <button
                    key={moment.id}
                    type="button"
                    className={moment.id === selectedMoment.id ? 'moment-card active' : 'moment-card'}
                    onClick={() => setSelectedMomentId(moment.id)}
                  >
                    <span>{moment.over}</span>
                    <strong>{moment.title}</strong>
                    <p>{moment.summary}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="subpanel-heading">
                <h3>Reaction deck</h3>
                <span>Firebase live updates</span>
              </div>
              <div className="reaction-grid">
                {selectedRoom.reactions.map((reaction) => (
                  <button
                    key={reaction.id}
                    type="button"
                    className="reaction-button"
                    onClick={() => handleReaction(reaction.id)}
                  >
                    <span className="reaction-emoji">{reaction.emoji}</span>
                    <div className="reaction-copy">
                      <strong>{reaction.label}</strong>
                      <span>{reaction.count} fans</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <section className="panel scorer-panel">
            <div className="subpanel-heading">
              <h3>Live scorer controls</h3>
              <span>Update score and match events here</span>
            </div>

            <div className="cricapi-fetch-bar" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="CricAPI Key"
                value={cricApiKey}
                onChange={(e) => setCricApiKey(e.target.value)}
                className="scorer-input"
                style={{ flex: 1 }}
              />
              <input
                type="text"
                placeholder="CricAPI Match ID"
                value={cricApiMatchId}
                onChange={(e) => setCricApiMatchId(e.target.value)}
                className="scorer-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="send-button"
                onClick={handleFetchCricApi}
                disabled={isFetchingCricApi}
                style={{ padding: '0 16px', whiteSpace: 'nowrap' }}
              >
                {isFetchingCricApi ? 'Fetching...' : 'Fetch CricAPI'}
              </button>
            </div>

            <div className="scorer-grid">
              <label className="field-block">
                <span>Stage</span>
                <input value={liveStageDraft} onChange={(event) => setLiveStageDraft(event.target.value)} className="scorer-input" />
              </label>
              <label className="field-block">
                <span>Score</span>
                <input value={liveScoreDraft} onChange={(event) => setLiveScoreDraft(event.target.value)} className="scorer-input" />
              </label>
              <label className="field-block">
                <span>Equation</span>
                <input value={liveChaseDraft} onChange={(event) => setLiveChaseDraft(event.target.value)} className="scorer-input" />
              </label>
              <label className="field-block">
                <span>Mood</span>
                <input value={liveMoodDraft} onChange={(event) => setLiveMoodDraft(event.target.value)} className="scorer-input" />
              </label>
            </div>
            <button type="button" className="send-button" onClick={handleLiveScoreUpdate}>
              Update live scoreboard
            </button>
            <div className="scorer-grid moment-editor-grid">
              <label className="field-block">
                <span>Over</span>
                <input value={momentOverDraft} onChange={(event) => setMomentOverDraft(event.target.value)} className="scorer-input" />
              </label>
              <label className="field-block">
                <span>Moment title</span>
                <input value={momentTitleDraft} onChange={(event) => setMomentTitleDraft(event.target.value)} className="scorer-input" />
              </label>
              <label className="field-block field-wide">
                <span>Moment summary</span>
                <textarea value={momentSummaryDraft} onChange={(event) => setMomentSummaryDraft(event.target.value)} className="chat-input scorer-textarea" rows={2} />
              </label>
              <label className="field-block field-wide">
                <span>Fan prompt</span>
                <textarea value={momentPromptDraft} onChange={(event) => setMomentPromptDraft(event.target.value)} className="chat-input scorer-textarea" rows={2} />
              </label>
            </div>
            <button type="button" className="send-button secondary-action" onClick={handlePushMoment}>
              Push live moment
            </button>
          </section>

          <div className="communications-grid">
            <section className="panel focus-panel">
              <div className="subpanel-heading">
                <h3>Moment room</h3>
                <span>{selectedMoment.over}</span>
              </div>
              <h3 className="focus-title">{selectedMoment.title}</h3>
              <p>{selectedMoment.summary}</p>
              <div className="prompt-box">
                <span>Talk point</span>
                <p>{selectedMoment.prompt}</p>
              </div>
              <div className="chant-strip">
                {quickChants.map((chant) => (
                  <button
                    key={chant}
                    type="button"
                    className="chant-chip"
                    onClick={() => setDraftMessage(chant)}
                  >
                    {chant}
                  </button>
                ))}
              </div>
            </section>

            <section className="panel emoji-panel">
              <div className="subpanel-heading">
                <h3>Cricket emoji signals</h3>
                <span>Google-backed live chat</span>
              </div>
              <div className="emoji-grid">
                {cricketSignals.map((signal) => (
                  <button
                    key={signal.label}
                    type="button"
                    className="emoji-chip"
                    onClick={() => setDraftMessage(signal.text)}
                  >
                    <span className="emoji-big">{signal.emoji}</span>
                    <strong>{signal.label}</strong>
                  </button>
                ))}
              </div>
              <div className="signal-bar">
                {cricketSignals.map((signal) => (
                  <button
                    key={`${signal.label}-append`}
                    type="button"
                    className="signal-button"
                    onClick={() => addSignal(signal.emoji)}
                    aria-label={`Add ${signal.label} emoji`}
                  >
                    {signal.emoji}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <section className="panel chat-panel">
            <div className="subpanel-heading">
              <h3>Fan communication lane</h3>
              <span>{selectedRoom.chat.length} live messages</span>
            </div>
            <form
              className="chat-form"
              onSubmit={(event) => {
                event.preventDefault()
                handleSendMessage(draftMessage)
              }}
            >
              <textarea
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                className="chat-input"
                rows={3}
                placeholder="Drop your cricket take, over call, or emoji-heavy reaction..."
              />
              <button type="submit" className="send-button">
                Send to room
              </button>
            </form>
            <div className="chat-list">
              {selectedRoom.chat.map((message) => (
                <article key={message.id} className="chat-message">
                  <div className="chat-meta">
                    <strong>{message.author}</strong>
                    <span>
                      {message.tribe} · {message.time}
                    </span>
                  </div>
                  <p>{message.text}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  )
}

export default App
