import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import GameBoardFinal from '../components/GameBoardFinal'
import PlayerPanel from '../components/PlayerPanel'
import CardModal from '../components/CardModal'
import VictoryScreen from '../components/VictoryScreen'
import questionsData from '../data/questions.json'
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'

// Import card assets for the deck
import cardStepImg from '../../assets/card_step.webp'
import cardChallengeImg from '../../assets/card_challenge.webp'
import cardLearningImg from '../../assets/card_learning.webp'
import cardHelpImg from '../../assets/card_help.webp'
import avatarImg from '../../assets/avatar.png'

// SFX Imports
import sfxCardFlip from '../../assets/sfx/Card-flip.mp3'
import sfxStep from '../../assets/sfx/cartoon_pop.mp3'
import sfxCorrect from '../../assets/sfx/correct.mp3'
import sfxWrong from '../../assets/sfx/wrong.mp3'
import sfxSparkle from '../../assets/sfx/magical-sparkle.mp3'
import sfxBgMusic from '../../assets/sfx/background-music.mp3'

const Game = () => {
  const navigate = useNavigate()
  const gameMode = localStorage.getItem('gameMode') || 'single'
  
  // Get player info from localStorage
  const player1Name = localStorage.getItem('player1Name') || 'Player 1'
  const player2Name = localStorage.getItem('player2Name') || 'Player 2'
  const player1Pion = localStorage.getItem('player1Pion') || 'boy'
  const player2Pion = localStorage.getItem('player2Pion') || 'girl'
  
  // State management
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [player1Position, setPlayer1Position] = useState(0)
  const [player2Position, setPlayer2Position] = useState(0)
  const [player1Score, setPlayer1Score] = useState(0)
  const [player2Score, setPlayer2Score] = useState(0)
  const [isRolling, setIsRolling] = useState(false)
  const [drawnNumber, setDrawnNumber] = useState(null)
  
  const [showCard, setShowCard] = useState(false)
  const [currentCard, setCurrentCard] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Determine First Player State
  const [isDeterminingFirst, setIsDeterminingFirst] = useState(gameMode === 'multi')
  const [p1StartRoll, setP1StartRoll] = useState(null)
  const [p2StartRoll, setP2StartRoll] = useState(null)
  const [startRollStep, setStartRollStep] = useState(1) // 1: P1 rolls, 2: P2 rolls, 3: Result

  // Kartu Belajar & Naratif State
  const [showBelajar, setShowBelajar] = useState(false)
  const [currentBelajarId, setCurrentBelajarId] = useState(null)
  const [narrativeText, setNarrativeText] = useState(gameMode === 'multi' ? "Ayo tentukan siapa yang jalan duluan!" : "Halo! Tekan Kartu Langkah untuk berjalan!")
  
  // Powerups (Bantuan)
  const [p1Powerups, setP1Powerups] = useState({ polisi: 1, lampu: 1, skip: 1 })
  const [p2Powerups, setP2Powerups] = useState({ polisi: 1, lampu: 1, skip: 1 })
  
  const belajarModalRef = useRef(null)

  const playSfx = useCallback((src) => {
    const audio = new Audio(src);
    audio.play().catch(e => console.log("SFX error:", e));
  }, []);

  // Background Music
  useEffect(() => {
    const bgm = new Audio(sfxBgMusic);
    bgm.loop = true;
    bgm.volume = 0.2; 
    
    const startBgm = () => {
      bgm.play().catch(e => console.log("BGM error:", e));
      document.removeEventListener('click', startBgm);
    }
    document.addEventListener('click', startBgm);
    
    return () => {
      bgm.pause();
      document.removeEventListener('click', startBgm);
    }
  }, []);

  useEffect(() => {
    if (showBelajar && belajarModalRef.current) {
       gsap.fromTo(belajarModalRef.current, 
         { scale: 0, rotation: -10, opacity: 0 },
         { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }
       )
    }
  }, [showBelajar])
  
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [isPlayerMoving, setIsPlayerMoving] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const stepCardRef = useRef(null)
  const deckRef = useRef(null)

  // ============================================================
  // WAYPOINTS — 60 petak di 6 map
  // Formula: globalX = (mapIndex * 100 + localX) / 6
  // localX=50 → pion muncul di 50% lebar viewport (tengah layar)
  // Jalur: pion masuk dari awal jalan tiap map, keluar di ujung jalan
  // ============================================================
  const generateCoordinates = () => {
    const coords = [];
    const TOTAL_MAPS = 8;

    const mapPaths = [
      // Map 1
      [
        {x: 35, y: 91.5}, {x: 41.3, y: 84.3}, {x: 47.1, y: 77.8}, {x: 52.6, y: 73.3}, {x: 58.7, y: 68.4},
        {x: 64, y: 64.2}, {x: 66.4, y: 58}, {x: 70.2, y: 53}, {x: 73.6, y: 45.9}, {x: 71.9, y: 39.8}
      ],
      // Map 2
      [
        {x: 38.3, y: 91.8}, {x: 43, y: 84.1}, {x: 46.4, y: 79}, {x: 49.9, y: 72.8}, {x: 56.4, y: 60.4},
        {x: 61.8, y: 51.9}, {x: 65.2, y: 45}, {x: 68.5, y: 40.3}, {x: 71.9, y: 36.5}, {x: 74.7, y: 29.9}
      ],
      // Map 3
      [
        {x: 32, y: 94.5}, {x: 40.1, y: 89.3}, {x: 47.9, y: 84.1}, {x: 54.5, y: 82.2}, {x: 62, y: 76.4},
        {x: 66.9, y: 68.8}, {x: 71, y: 63.3}, {x: 76.3, y: 58.9}, {x: 81, y: 55.4}, {x: 91.4, y: 49.6}
      ],
      // Map 4
      [
        {x: 36.2, y: 93.9}, {x: 42.4, y: 83.1}, {x: 46, y: 72.4}, {x: 50, y: 62.6}, {x: 54.3, y: 54.8},
        {x: 56.2, y: 47.6}, {x: 55.5, y: 41.4}, {x: 56.5, y: 37.8}, {x: 58.3, y: 34.9}, {x: 61.3, y: 31.8}
      ],
      // Map 5
      [
        {x: 30.3, y: 93.8}, {x: 39.3, y: 87.2}, {x: 46, y: 83.2}, {x: 54.4, y: 80}, {x: 63.7, y: 75.8},
        {x: 69.9, y: 71.3}, {x: 74.1, y: 64.3}, {x: 78.3, y: 56.2}, {x: 83.1, y: 51.3}, {x: 92.4, y: 43.4}
      ],
      // Map 6
      [
        {x: 24, y: 92}, {x: 35.5, y: 84.7}, {x: 46.6, y: 78.4}, {x: 54.9, y: 72.8}, {x: 61.8, y: 68.2},
        {x: 68.2, y: 64.3}, {x: 75.7, y: 60.7}, {x: 81.8, y: 58.4}, {x: 87.5, y: 54.8}, {x: 93.8, y: 49.6}
      ],
      // Map 7
      [
        {x: 22.4, y: 93.3}, {x: 29.6, y: 87.1}, {x: 37.8, y: 82.9}, {x: 44.7, y: 78.5}, {x: 51, y: 71.9},
        {x: 55.1, y: 65.2}, {x: 59.2, y: 60.3}, {x: 62.9, y: 56.2}, {x: 65.9, y: 52.7}, {x: 71.4, y: 44.6}
      ],
      // Map 8
      [
        {x: 35.4, y: 97.6}, {x: 39.3, y: 93.2}, {x: 42.3, y: 88.4}, {x: 45.5, y: 83}, {x: 48.9, y: 77.4},
        {x: 51, y: 74.9}, {x: 53.6, y: 70.6}, {x: 56.5, y: 66}, {x: 55.1, y: 59.4}, {x: 49.8, y: 50.8}
      ],
    ];

    for (let m = 0; m < TOTAL_MAPS; m++) {
      for (let t = 0; t < 10; t++) {
        const wp = mapPaths[m][t];
        const globalX = (m * 100 + wp.x) / TOTAL_MAPS;
        coords.push({ x: `${globalX.toFixed(2)}%`, y: `${wp.y}%` });
      }
    }
    return coords;
  }
  const tileCoordinates = useRef(generateCoordinates()).current;


  // Handle Start Roll for 2 Players
  const handleStartRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    playSfx(sfxCardFlip);

    const val = Math.floor(Math.random() * 6) + 1;
    
    if (startRollStep === 1) {
      setP1StartRoll(val);
      setTimeout(() => {
        setIsRolling(false);
        setStartRollStep(2);
      }, 1000);
    } else if (startRollStep === 2) {
      setP2StartRoll(val);
      setTimeout(() => {
        setIsRolling(false);
        setStartRollStep(3);
        
        // Finalize who goes first
        setTimeout(() => {
          if (val > p1StartRoll) {
            setCurrentPlayer(2);
            setNarrativeText(`${player2Name} menang kocokan! Giliranmu duluan.`);
          } else if (p1StartRoll > val) {
            setCurrentPlayer(1);
            setNarrativeText(`${player1Name} menang kocokan! Giliranmu duluan.`);
          } else {
            // Seri, ulang lagi
            setNarrativeText("Hasil seri! Ayo kocok lagi.");
            setP1StartRoll(null);
            setP2StartRoll(null);
            setStartRollStep(1);
            return;
          }
          
          setTimeout(() => {
            setIsDeterminingFirst(false);
          }, 2000);
        }, 1000);
      }, 1000);
    }
  };

  const drawStepCard = useCallback(() => {
    if (isRolling || gameOver || isPlayerMoving || isDeterminingFirst) return
    
    setIsRolling(true)
    playSfx(sfxCardFlip)
    
    gsap.to(stepCardRef.current, {
      rotationY: 90,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        const randomValue = Math.floor(Math.random() * 5) + 1
        setDrawnNumber(randomValue)
        setNarrativeText(`Wah, dapat angka ${randomValue}! Ayo jalan!`)
        
        gsap.to(stepCardRef.current, {
          rotationY: 0,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            setTimeout(() => {
              toggleDeck(false)
              setNarrativeText("Sedang berjalan...")
              movePlayer(randomValue)
            }, 1500)
          }
        })
      }
    })
  }, [isRolling, gameOver, isPlayerMoving, isDeterminingFirst])

  const toggleDeck = (show) => {
    if (deckRef.current) {
      gsap.to(deckRef.current, {
        y: show ? 0 : 150,
        opacity: show ? 1 : 0,
        duration: 0.5,
        ease: show ? "back.out(1.5)" : "power2.in"
      })
    }
  }

  const movePlayer = useCallback((steps) => {
    setIsPlayerMoving(true)
    toggleDeck(false)

    const currentPos = currentPlayer === 1 ? player1Position : player2Position
    const targetPos = Math.min(currentPos + steps, tileCoordinates.length - 1)

    // BUG FIX: Gerakkan SEMUA langkah dulu, baru cek special tile di posisi akhir.
    // Sebelumnya: clearInterval saat MELEWATI special tile → dapat 5 langkah tapi berhenti di langkah 3.
    // Sekarang: special tile hanya dicek saat MENDARAT, bukan saat dilewati.
    let currentStep = currentPos
    const moveInterval = setInterval(() => {
      currentStep++
      playSfx(sfxStep)

      if (currentPlayer === 1) {
        setPlayer1Position(currentStep)
      } else {
        setPlayer2Position(currentStep)
      }

      if (currentStep >= targetPos) {
        clearInterval(moveInterval)

        // Cek game over
        if (currentStep >= tileCoordinates.length - 1) {
          setGameOver(true)
          setWinner(currentPlayer)
          return
        }

        // Cek jenis tile saat LANDING:
        // - Kelipatan 3 → soal pasti muncul (semua 20 soal terjamin)
        // - Petak biasa → 25% muncul Kartu Belajar, 75% lanjut giliran
        const isSpecialTile = currentStep % 3 === 0 && currentStep > 0
        setTimeout(() => {
          if (isSpecialTile) {
            // Soal diulang dari awal jika sudah habis semua 20 (loop)
            const qIndex = currentQuestionIndex % questionsData.length
            setCurrentCard(questionsData[qIndex])
            setShowCard(true)
            setNarrativeText('Siap-siap, jawab tantangan ini dengan benar ya!')
          } else if (Math.random() < 0.25) {
            // Kartu Belajar muncul di petak biasa (25% peluang)
            const randomId = Math.floor(Math.random() * 7) + 1
            setCurrentBelajarId(randomId)
            setShowBelajar(true)
            setNarrativeText('Wah, ada info baru! Kartu Belajar ditemukan!')
            playSfx(sfxSparkle)
          } else {
            finishTurn()
          }
        }, 600)
      }
    }, 500) // 500ms per langkah — lebih smooth
  }, [currentPlayer, player1Position, player2Position, tileCoordinates.length, currentQuestionIndex])

  const finishTurn = () => {
    setTimeout(() => {
      setDrawnNumber(null)
      if (gameMode === 'multi') {
        const nextPlayer = currentPlayer === 1 ? 2 : 1;
        setCurrentPlayer(nextPlayer)
        setNarrativeText(`Giliran ${nextPlayer === 1 ? player1Name : player2Name}! Tekan Kartu Langkah.`);
      } else {
        setCurrentPlayer(1) 
        setNarrativeText("Giliranmu lagi! Tekan Kartu Langkah.");
      }
      setIsPlayerMoving(false)
      setIsRolling(false)
      toggleDeck(true) 
    }, 500)
  }

  const handleCloseBelajar = useCallback(() => {
    if (currentPlayer === 1) {
      setPlayer1Score(prev => prev + 5)
    } else {
      setPlayer2Score(prev => prev + 5)
    }
    
    setNarrativeText("Asyik, dapat +5 poin karena belajar! Lanjut jalan yuk.");
    setShowBelajar(false)
    setCurrentBelajarId(null)
    finishTurn()
  }, [currentPlayer])

  const handleUsePowerup = useCallback((playerNum, type) => {
    if (playerNum === 1) {
       setP1Powerups(prev => ({...prev, [type]: prev[type] - 1}));
    } else {
       setP2Powerups(prev => ({...prev, [type]: prev[type] - 1}));
    }
    setNarrativeText(`Kamu menggunakan Bantuan: ${type.toUpperCase()}!`);
    playSfx(sfxSparkle);
  }, []);

  const handleCardAnswer = useCallback((isCorrect, selectedAnswer = null) => {
    if (isCorrect) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFC107', '#4CAF50', '#2196F3', '#E91E63'],
        zIndex: 1000
      })

      setCorrectAnswers(prev => prev + 1)
      
      if (currentPlayer === 1) {
        setPlayer1Score(prev => prev + 10)
      } else {
        setPlayer2Score(prev => prev + 10)
      }
      playSfx(sfxCorrect);
    } else {
      playSfx(sfxWrong);
    }
    
    setTotalQuestions(prev => prev + 1)
    setCurrentQuestionIndex(prev => prev + 1)
    setShowCard(false)
    setCurrentCard(null)
    finishTurn()
  }, [currentPlayer])

  const resetGame = useCallback(() => {
    navigate('/setup')
  }, [navigate])

  useEffect(() => {
    gsap.to('.deck-card', {
      y: -10,
      rotation: 'random(-3, 3)',
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      stagger: 0.2
    })
  }, [])

  return (
    <div className="game-container relative w-full h-screen overflow-hidden bg-sky-200">
      <GameBoardFinal
        player1Position={player1Position}
        player2Position={player2Position}
        gameMode={gameMode}
        tileCoordinates={tileCoordinates}
        player1Pion={player1Pion}
        player2Pion={player2Pion}
        showDebug={showDebug}
      />
      
      {/* UI Panels */}
      <div className="absolute top-6 left-6 z-40">
        <PlayerPanel
          playerNumber={1}
          playerName={player1Name}
          score={player1Score}
          position={player1Position}
          isActive={currentPlayer === 1 && !isDeterminingFirst}
          pionType={player1Pion}
        />
      </div>
      
      {gameMode === 'multi' && (
        <div className="absolute top-6 right-24 z-40">
          <PlayerPanel
            playerNumber={2}
            playerName={player2Name}
            score={player2Score}
            position={player2Position}
            isActive={currentPlayer === 2 && !isDeterminingFirst}
            isFlipped={true}
            pionType={player2Pion}
          />
        </div>
      )}
      
      {/* First Player Determination Overlay */}
      {isDeterminingFirst && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white/90 p-8 rounded-[3rem] border-8 border-yellow-400 shadow-2xl max-w-2xl w-full text-center">
            <h2 className="text-4xl font-black text-blue-800 mb-8 uppercase tracking-widest">Siapa yang duluan?</h2>
            
            <div className="flex justify-around items-center mb-10">
              <div className={`p-6 rounded-3xl transition-all ${startRollStep === 1 ? 'bg-yellow-100 ring-4 ring-yellow-400 scale-110' : 'bg-gray-100 opacity-50'}`}>
                <p className="font-bold text-blue-600 mb-4">{player1Name}</p>
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-inner border-2 border-blue-200 overflow-hidden">
                  {p1StartRoll ? (
                    <img src={new URL(`../../assets/dice_${p1StartRoll}.webp`, import.meta.url).href} alt={`Dice ${p1StartRoll}`} className="w-20 h-20 object-contain" />
                  ) : (
                    <span className="text-4xl font-black text-gray-300">?</span>
                  )}
                </div>
              </div>
              
              <div className="text-3xl font-black text-gray-400">VS</div>
              
              <div className={`p-6 rounded-3xl transition-all ${startRollStep === 2 ? 'bg-pink-100 ring-4 ring-pink-400 scale-110' : 'bg-gray-100 opacity-50'}`}>
                <p className="font-bold text-pink-600 mb-4">{player2Name}</p>
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-inner border-2 border-pink-200 overflow-hidden">
                  {p2StartRoll ? (
                    <img src={new URL(`../../assets/dice_${p2StartRoll}.webp`, import.meta.url).href} alt={`Dice ${p2StartRoll}`} className="w-20 h-20 object-contain" />
                  ) : (
                    <span className="text-4xl font-black text-gray-300">?</span>
                  )}
                </div>
              </div>
            </div>
            
            {startRollStep < 3 ? (
              <button 
                onClick={handleStartRoll}
                className={`px-12 py-5 rounded-2xl font-black text-2xl text-white shadow-lg transform active:scale-95 transition-all ${startRollStep === 1 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-pink-500 hover:bg-pink-600'}`}
              >
                {startRollStep === 1 ? `${player1Name} KOCOK!` : `${player2Name} KOCOK!`}
              </button>
            ) : (
              <div className="text-3xl font-black text-green-600 animate-bounce">
                {p1StartRoll > p2StartRoll ? `${player1Name} MULAI!` : `${player2Name} MULAI!`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Menu & Indicators */}
      <div className="absolute top-4 right-4 z-50">
        <button onClick={() => setShowMenu(!showMenu)} className="bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        {showMenu && (
          <div className="absolute top-16 right-0 w-60 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-200 p-2 flex flex-col gap-1 animate-fade-in origin-top-right">
            <button onClick={() => { navigate('/setup'); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-800 font-bold rounded-xl transition-colors flex items-center gap-3">
               🔄 Ulangi Game
            </button>
            <button
              onClick={() => { setShowDebug(v => !v); setShowMenu(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors flex items-center gap-3 ${
                showDebug ? 'bg-orange-100 text-orange-700' : 'hover:bg-orange-50 text-gray-800'
              }`}
            >
               🔧 {showDebug ? 'Matikan Debug' : 'Mode Debug Jalur'}
            </button>
            <button onClick={() => navigate('/')} className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-bold rounded-xl transition-colors flex items-center gap-3">
               🚪 Keluar
            </button>
          </div>
        )}
      </div>

      {!isDeterminingFirst && !showDebug && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 border-4 border-white rounded-full px-8 py-1.5 shadow-xl z-40 font-bold text-base md:text-lg animate-bounce">
          {gameMode === 'multi' 
            ? `Giliran ${currentPlayer === 1 ? player1Name : player2Name}`
            : `Jalan Terus, ${player1Name}!`
          }
        </div>
      )}
      
      {/* Deck Kartu */}
      {!showDebug && (
      <div ref={deckRef} className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-end space-x-3 z-40">
        {/* Kartu sampingan */}
        <div className="relative cursor-not-allowed hidden md:block deck-card">
           <img src={cardHelpImg} alt="Help" className="w-24 h-36 object-cover rounded-2xl shadow-xl border-4 border-green-400" />
        </div>
        <div className="relative cursor-not-allowed hidden md:block deck-card">
           <img src={cardLearningImg} alt="Learning" className="w-24 h-36 object-cover rounded-2xl shadow-xl border-4 border-blue-400" />
        </div>
        
        {/* Kartu Langkah (Interaktif) */}
        <div
          className={`relative cursor-pointer transition-transform hover:-translate-y-2 ${isRolling || isPlayerMoving || isDeterminingFirst ? 'pointer-events-none' : ''}`}
          onClick={drawStepCard}
        >
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full text-xs font-bold text-blue-600 shadow-md whitespace-nowrap animate-pulse">
            Klik Kartu Langkah!
          </div>
          <div ref={stepCardRef} className="relative w-32 h-48 perspective-1000">
            {drawnNumber ? (
              <div className="w-full h-full bg-white rounded-xl shadow-2xl border-4 border-blue-500 flex flex-col items-center justify-center">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kamu dapat</span>
                 <span className="text-6xl font-black text-blue-600 drop-shadow-md">{drawnNumber}</span>
                 <span className="text-sm font-bold text-gray-500 mt-2 uppercase tracking-widest">Langkah</span>
              </div>
            ) : (
              <img src={cardStepImg} alt="Step Card" className="w-full h-full object-cover rounded-xl shadow-2xl border-2 border-white" />
            )}
          </div>
        </div>

      </div>
      )}

      {/* Narrative Box */}
      {!showDebug && (
      <div className="absolute bottom-6 md:bottom-10 right-4 md:right-10 z-50 pointer-events-none w-64 md:w-80">
        <div className="bg-white/90 backdrop-blur-lg px-5 py-3 rounded-2xl shadow-xl border-4 border-blue-400 flex items-center gap-3 transform transition-all hover:scale-105">
          <div className="bg-blue-100 rounded-full p-1 border-2 border-blue-300 shadow-inner flex-shrink-0">
             <img src={avatarImg} alt="Avatar" className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full" />
          </div>
          <div className="flex-1">
             <p className="text-gray-800 font-bold text-xs md:text-sm leading-tight italic">"{narrativeText}"</p>
          </div>
        </div>
      </div>
      )}

      {/* Modal Kartu Belajar — Premium */}
      {showBelajar && currentBelajarId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'radial-gradient(ellipse at center, rgba(10,10,60,0.92) 0%, rgba(0,0,0,0.96) 100%)' }}>
          
          {/* Dekorasi bintang-bintang latar */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {['10%,15%','85%,10%','20%,80%','75%,75%','50%,5%','5%,50%','90%,55%'].map((pos, i) => (
              <div key={i} className="absolute text-yellow-300 animate-pulse"
                style={{ left: pos.split(',')[0], top: pos.split(',')[1], fontSize: `${10 + (i % 3) * 6}px`, animationDelay: `${i * 0.3}s` }}>
                ✦
              </div>
            ))}
          </div>

          <div ref={belajarModalRef} className="relative w-full max-w-sm">
            {/* Badge header */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-yellow-900 font-black text-sm px-8 py-2 rounded-full shadow-xl border-2 border-yellow-200 whitespace-nowrap">
              ⭐ KARTU BELAJAR ⭐
            </div>

            {/* Frame utama */}
            <div className="rounded-[2rem] p-[3px] shadow-[0_0_60px_rgba(99,102,241,0.6),0_0_120px_rgba(59,130,246,0.3)]"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #818cf8, #3b82f6, #fbbf24)' }}>
              <div className="rounded-[1.85rem] overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #1e3a8a 50%, #1e1b4b 100%)' }}>
                
                {/* Gambar kartu dengan frame emas */}
                <div className="relative p-3 pb-0">
                  <div className="rounded-2xl overflow-hidden ring-2 ring-yellow-400/50 shadow-2xl">
                    <img
                      src={currentBelajarId === 7
                        ? new URL('../../assets/kartu_belajar7.webp', import.meta.url).href
                        : new URL(`../../assets/kartu_belajar${currentBelajarId}.png`, import.meta.url).href
                      }
                      className="w-full object-contain"
                      style={{ maxHeight: '55vh' }}
                    />
                  </div>
                  {/* Corner glow dekoratif */}
                  <div className="absolute top-3 left-3 w-6 h-6 rounded-tl-2xl border-t-2 border-l-2 border-yellow-400/70" />
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-tr-2xl border-t-2 border-r-2 border-yellow-400/70" />
                </div>

                {/* Tombol tutup */}
                <div className="p-4 pt-3">
                  <button
                    onClick={handleCloseBelajar}
                    className="w-full font-black text-base py-3.5 rounded-2xl transition-all active:scale-95 shadow-xl border-2 border-white/20 tracking-wide"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #f59e0b 100%)',
                      color: 'white',
                      textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      boxShadow: '0 4px 20px rgba(239,68,68,0.5)'
                    }}
                  >
                    Tutup &amp; Lanjut 🚀
                  </button>
                </div>
              </div>
            </div>

            {/* Corner stars dekoratif */}
            <div className="absolute -top-3 -left-3 text-3xl animate-spin" style={{ animationDuration: '8s' }}>⭐</div>
            <div className="absolute -top-3 -right-3 text-3xl animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>🌟</div>
            <div className="absolute -bottom-3 -left-3 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute -bottom-3 -right-3 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
          </div>
        </div>
      )}
      
      <CardModal show={showCard} card={currentCard} onAnswer={handleCardAnswer} powerups={currentPlayer === 1 ? p1Powerups : p2Powerups} onUsePowerup={(type) => handleUsePowerup(currentPlayer, type)} />
      
      <VictoryScreen show={gameOver} winner={winner === 1 ? player1Name : player2Name} player1Score={player1Score} player2Score={player2Score} totalQuestions={totalQuestions} correctAnswers={correctAnswers} gameMode={gameMode} onPlayAgain={resetGame} onBackToMenu={() => navigate('/')} />
    </div>
  )
}

export default Game
