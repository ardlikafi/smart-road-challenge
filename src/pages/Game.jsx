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
import cardStepImg from '../../assets/card_step.png'
import cardChallengeImg from '../../assets/card_challenge.png'
import cardLearningImg from '../../assets/card_learning.png'
import cardHelpImg from '../../assets/card_help.png'
import pionBoyImg from '../../assets/pion_boy.png'
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
  
  // Get player names from localStorage
  const player1Name = localStorage.getItem('player1Name') || 'Player 1'
  const player2Name = localStorage.getItem('player2Name') || 'Player 2'
  
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

  // Kartu Belajar & Naratif State
  const [showBelajar, setShowBelajar] = useState(false)
  const [currentBelajarId, setCurrentBelajarId] = useState(null)
  const [narrativeText, setNarrativeText] = useState("Halo! Tekan Kartu Langkah untuk berjalan!")
  
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
    bgm.volume = 0.2; // Volume rendah agar tidak mengganggu
    
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

  const stepCardRef = useRef(null)
  const deckRef = useRef(null)

  // Generate 100 waypoints
  const generateCoordinates = () => {
    const coords = [];
    
    // Konfigurasi X dan Y koordinat LOKAL untuk tiap 10 map (dalam persentase layar tunggal 0-100%)
    // Map 1: Mulai dari zebra cross bawah (x=30) serong ke kanan atas (jembatan)
    const mapPaths = [
      [
        {x: 30, y: 85}, {x: 35, y: 78}, {x: 42, y: 70}, {x: 50, y: 63}, {x: 58, y: 57},
        {x: 66, y: 52}, {x: 74, y: 48}, {x: 82, y: 45}, {x: 90, y: 43}, {x: 96, y: 42}
      ],
      // Map 2: Dari jembatan turun perlahan ke jalan lurus (y=65)
      [
        {x: 5, y: 42}, {x: 15, y: 45}, {x: 25, y: 49}, {x: 35, y: 54}, {x: 45, y: 59},
        {x: 55, y: 63}, {x: 65, y: 65}, {x: 75, y: 65}, {x: 85, y: 65}, {x: 95, y: 65}
      ],
      // Map 3 - 9: Jalan raya mendatar lurus (y=65)
      ...Array(7).fill([
        {x: 5, y: 65}, {x: 15, y: 65}, {x: 25, y: 65}, {x: 35, y: 65}, {x: 45, y: 65},
        {x: 55, y: 65}, {x: 65, y: 65}, {x: 75, y: 65}, {x: 85, y: 65}, {x: 95, y: 65}
      ]),
      // Map 10: Ujung jalan menuju bangunan sekolah (mengecil ke tengah)
      [
        {x: 5, y: 65}, {x: 15, y: 65}, {x: 25, y: 65}, {x: 35, y: 63}, {x: 45, y: 60},
        {x: 55, y: 57}, {x: 65, y: 53}, {x: 75, y: 49}, {x: 85, y: 45}, {x: 90, y: 40}
      ]
    ];

    for (let m = 0; m < 10; m++) {
      for (let t = 0; t < 10; t++) {
        // Konversi koordinat lokal map ke koordinat global (karena lebar total = 1000%)
        // 1 map = 10% lebar global. 
        const localX = mapPaths[m] ? mapPaths[m][t].x : (t * 10 + 5);
        const localY = mapPaths[m] ? mapPaths[m][t].y : 65;
        
        const globalX = (m * 10) + (localX / 10);
        coords.push({ x: `${globalX.toFixed(2)}%`, y: `${localY}%` });
      }
    }
    return coords;
  }
  const tileCoordinates = useRef(generateCoordinates()).current;

  // Draw Step Card function (Pengganti Dadu)
  const drawStepCard = useCallback(() => {
    if (isRolling || gameOver || isPlayerMoving) return
    
    setIsRolling(true)
    playSfx(sfxCardFlip)
    
    // Animasi GSAP Flip
    gsap.to(stepCardRef.current, {
      rotationY: 90,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        const randomValue = Math.floor(Math.random() * 4) + 1 // Angka 1-4
        setDrawnNumber(randomValue)
        setNarrativeText(`Wah, dapat angka ${randomValue}! Ayo jalan!`)
        
        gsap.to(stepCardRef.current, {
          rotationY: 0,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            // Tunggu 1.5 detik agar pemain melihat angka, lalu hide deck dan jalan
            setTimeout(() => {
              toggleDeck(false)
              setNarrativeText("Sedang berjalan...")
              movePlayer(randomValue)
            }, 1500)
          }
        })
      }
    })
  }, [isRolling, gameOver, isPlayerMoving])

  // Hide deck during movement
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

  // Move player function - Step by step movement
  const movePlayer = useCallback((steps) => {
    setIsPlayerMoving(true)
    toggleDeck(false) // Sembunyikan deck saat jalan
    
    const currentPos = currentPlayer === 1 ? player1Position : player2Position
    const targetPos = Math.min(currentPos + steps, tileCoordinates.length - 1)
    
    let currentStep = currentPos
    const moveInterval = setInterval(() => {
      currentStep++
      playSfx(sfxStep) // Suara langkah
      
      if (currentStep <= targetPos) {
        if (currentPlayer === 1) {
          setPlayer1Position(currentStep)
        } else {
          setPlayer2Position(currentStep)
        }
        
        // Cek petak tantangan (Misal setiap 4-5 petak)
        const specialTiles = [
          5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 
          55, 60, 65, 70, 75, 80, 85, 90, 95, 98
        ];
        if (specialTiles.includes(currentStep)) {
          clearInterval(moveInterval) // Pause gerakan
          setTimeout(() => {
            // Peluang 30% untuk Kartu Belajar, 70% Kartu Tantangan
            const isBelajar = Math.random() < 0.3;
            if (isBelajar) {
              const randomId = Math.floor(Math.random() * 7) + 1; // 1 to 7
              setCurrentBelajarId(randomId);
              setShowBelajar(true);
              setNarrativeText("Wah, ada info baru! Kartu Belajar ditemukan!");
              playSfx(sfxSparkle);
            } else {
              if (currentQuestionIndex < questionsData.length) {
                setCurrentCard(questionsData[currentQuestionIndex])
                setShowCard(true)
                setNarrativeText("Siap-siap, jawab tantangan ini dengan benar ya!");
              } else {
                finishTurn(); // Jika soal habis, jalan terus
              }
            }
          }, 1000)
          return
        }
        
        // Cek Game Over
        if (currentStep >= tileCoordinates.length - 1) {
          setGameOver(true)
          setWinner(currentPlayer)
          clearInterval(moveInterval)
          return
        }
      } else {
        clearInterval(moveInterval)
        finishTurn()
      }
    }, 600) // 600ms per step agar terlihat meliuk mulus (nanti diatur GSAP motionPath di GameBoard)
  }, [currentPlayer, player1Position, player2Position, tileCoordinates.length, currentQuestionIndex])

  const finishTurn = () => {
    setTimeout(() => {
      // Reset kartu langkah
      setDrawnNumber(null)
      if (gameMode === 'multi') {
        const nextPlayer = currentPlayer === 1 ? 2 : 1;
        setCurrentPlayer(nextPlayer)
        setNarrativeText(`Giliran Player ${nextPlayer}! Tekan Kartu Langkah.`);
      } else {
        setCurrentPlayer(1) // Keep Player 1 in single player mode
        setNarrativeText("Giliranmu lagi! Tekan Kartu Langkah.");
      }
      setIsPlayerMoving(false)
      setIsRolling(false)
      toggleDeck(true) // Munculkan deck lagi
    }, 500)
  }

  // Handle tutup Kartu Belajar
  const handleCloseBelajar = useCallback(() => {
    // Beri bonus 5 poin
    if (currentPlayer === 1) {
      setPlayer1Score(prev => prev + 5)
    } else {
      setPlayer2Score(prev => prev + 5)
    }
    
    setNarrativeText("Asyik, dapat +5 poin karena belajar! Lanjut jalan yuk.");
    setShowBelajar(false)
    setCurrentBelajarId(null)
    
    // Lanjutkan giliran
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

  // Handle card answer
  const handleCardAnswer = useCallback((isCorrect, selectedAnswer = null) => {
    // Alur Feedback dan Penilaian
    if (isCorrect) {
      // Efek konfeti saat jawaban benar!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFC107', '#4CAF50', '#2196F3', '#E91E63'],
        zIndex: 1000
      })

      setCorrectAnswers(prev => prev + 1)
      
      // Tambah skor 10 poin per soal benar
      if (currentPlayer === 1) {
        setPlayer1Score(prev => prev + 10)
      } else {
        setPlayer2Score(prev => prev + 10)
      }
      playSfx(sfxCorrect);
    } else {
      playSfx(sfxWrong);
    }
    
    // Lanjut ke soal berikutnya secara berurutan
    setTotalQuestions(prev => prev + 1)
    setCurrentQuestionIndex(prev => prev + 1)
    
    setShowCard(false)
    setCurrentCard(null)
    
    // Lanjutkan giliran setelah modal tertutup
    finishTurn()
  }, [currentPlayer])

  const resetGame = useCallback(() => {
    setCurrentPlayer(1)
    setPlayer1Position(0)
    setPlayer2Position(0)
    setPlayer1Score(0)
    setPlayer2Score(0)
    setIsRolling(false)
    setDrawnNumber(null)
    setShowCard(false)
    setCurrentCard(null)
    setCurrentQuestionIndex(0)
    setGameOver(false)
    setWinner(null)
    setTotalQuestions(0)
    setCorrectAnswers(0)
    setIsPlayerMoving(false)
    
    localStorage.removeItem('player1Name')
    localStorage.removeItem('player2Name')
    
    navigate('/setup')
  }, [navigate])

  // Idle floating animation for the deck cards
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
      />
      
      {/* Judul lama di atas dihapus, dipindah ke bawah */}

      {/* UI Panels */}
      <div className="absolute top-6 left-6 z-40">
        <PlayerPanel
          playerNumber={1}
          playerName={player1Name}
          score={player1Score}
          position={player1Position}
          isActive={currentPlayer === 1}
        />
      </div>
      
      {gameMode === 'multi' && (
        <div className="absolute top-6 right-24 z-40">
          <PlayerPanel
            playerNumber={2}
            playerName={player2Name}
            score={player2Score}
            position={player2Position}
            isActive={currentPlayer === 2}
            isFlipped={true}
          />
        </div>
      )}
      
      {/* Hamburger Navigation Menu */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all"
          title="Menu Game"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>

        {showMenu && (
          <div className="absolute top-16 right-0 w-56 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-200 p-2 flex flex-col gap-1 animate-fade-in origin-top-right">
            <button onClick={() => { resetGame(); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-800 font-bold rounded-xl transition-colors flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Ulangi Game
            </button>
            <button onClick={() => { alert("Menu Pengaturan (Sedang dikembangkan)"); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-yellow-50 text-gray-800 font-bold rounded-xl transition-colors flex items-center gap-3">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Pengaturan
            </button>
            <div className="h-px bg-gray-200 my-1 w-full"></div>
            <button onClick={() => navigate('/')} className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-bold rounded-xl transition-colors flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Keluar
            </button>
          </div>
        )}
      </div>

      {/* Current Turn Indicator */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 border-4 border-white rounded-full px-8 py-1.5 shadow-xl z-40 font-bold text-base md:text-lg animate-bounce">
        {gameMode === 'multi' 
          ? `Giliran ${currentPlayer === 1 ? player1Name : player2Name}`
          : `Jalan Terus, ${player1Name}!`
        }
      </div>
      
      {/* Deck Kartu Mekanisme (Pengganti Dadu) */}
      <div 
        ref={deckRef}
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex space-x-4 z-40"
      >
        {/* Tumpukan kartu statis (Dekorasi) */}
        <div className="relative group cursor-not-allowed hidden md:block opacity-70 deck-card hover:scale-105 transition-transform" onClick={() => alert("Kamu akan punya 3 Kartu Bantuan di sini nantinya!")}>
           <img src={cardHelpImg} alt="Help Deck" className="w-24 h-36 object-cover rounded-xl shadow-md border-2 border-white/50 cursor-pointer" />
        </div>
        <div className="relative group cursor-not-allowed hidden md:block opacity-70 deck-card hover:scale-105 transition-transform" onClick={() => alert("Koleksi Kartu Belajarmu akan muncul di sini!")}>
           <img src={cardLearningImg} alt="Learning Deck" className="w-24 h-36 object-cover rounded-xl shadow-md border-2 border-white/50 cursor-pointer" />
        </div>
        <div className="relative group cursor-not-allowed hidden sm:block opacity-70 deck-card">
           <img src={cardChallengeImg} alt="Challenge Deck" className="w-24 h-36 object-cover rounded-xl shadow-md border-2 border-white/50" />
        </div>

        {/* Kartu Langkah (Interaktif) */}
        <div 
          className={`relative cursor-pointer transition-transform hover:-translate-y-2 ${isRolling || isPlayerMoving ? 'pointer-events-none' : ''}`}
          onClick={drawStepCard}
        >
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full text-xs font-bold text-blue-600 shadow-md whitespace-nowrap animate-pulse">
            Klik Kartu Langkah!
          </div>
          
          <div ref={stepCardRef} className="relative w-32 h-48 perspective-1000">
            {drawnNumber ? (
              <div className="w-full h-full bg-white rounded-xl shadow-2xl border-4 border-blue-500 flex flex-col items-center justify-center">
                 <span className="text-6xl font-black text-blue-600 drop-shadow-md">{drawnNumber}</span>
                 <span className="text-sm font-bold text-gray-500 mt-2 uppercase tracking-widest">Langkah</span>
              </div>
            ) : (
              <img src={cardStepImg} alt="Step Card" className="w-full h-full object-cover rounded-xl shadow-2xl border-2 border-white" />
            )}
          </div>
        </div>
      </div>

      {/* Judul Estetik di Bawah Deck Kartu */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[100] pointer-events-none">
        <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/50 shadow-lg">
          <h1 className="text-xs md:text-sm font-extrabold text-white tracking-[0.25em] uppercase" style={{ fontFamily: "'Nunito', sans-serif", textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            Smart Road Challenge
          </h1>
        </div>
      </div>
      
      {/* Narrative Box */}
      <div className="absolute bottom-6 md:bottom-10 right-4 md:right-10 z-50 pointer-events-none w-64 md:w-80">
        <div className="bg-white/90 backdrop-blur-lg px-5 py-3 rounded-2xl shadow-xl border-4 border-blue-400 flex items-center gap-3 transform transition-all hover:scale-105">
          <div className="bg-blue-100 rounded-full p-1 border-2 border-blue-300 shadow-inner flex-shrink-0">
             <img src={avatarImg} alt="Avatar" className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full" />
          </div>
          <div className="flex-1">
             <p className="text-gray-800 font-bold text-xs md:text-sm leading-tight italic">
               "{narrativeText}"
             </p>
          </div>
        </div>
      </div>

      {/* Belajar Modal */}
      {showBelajar && currentBelajarId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 sm:p-6">
           <div 
             ref={belajarModalRef}
             className="bg-white/95 backdrop-blur-md border-4 border-white rounded-3xl p-4 sm:p-6 max-w-sm sm:max-w-md w-full text-center shadow-2xl flex flex-col max-h-[95vh]"
           >
              <div className="flex-shrink-0 mb-3">
                <div className="bg-green-500 text-white px-6 py-2 rounded-full font-extrabold text-sm sm:text-base inline-block shadow-md uppercase tracking-wider">
                   Info Penting!
                </div>
              </div>
              <div className="flex-1 min-h-0 relative flex items-center justify-center">
                <img 
                  src={currentBelajarId === 7 
                       ? new URL(`../../assets/kartu_belajar7.webp`, import.meta.url).href 
                       : new URL(`../../assets/kartu_belajar${currentBelajarId}.png`, import.meta.url).href}
                  alt="Kartu Belajar" 
                  className="w-full h-full max-h-[50vh] sm:max-h-[60vh] object-contain drop-shadow-xl" 
                />
              </div>
              <div className="flex-shrink-0 mt-4">
                <p className="text-gray-800 font-bold mb-4 text-sm sm:text-base">Membaca itu keren! <br/><span className="text-blue-600 font-black">+5 Poin Tambahan!</span></p>
                <button 
                   onClick={handleCloseBelajar}
                   className="w-full bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-black text-lg py-3 rounded-2xl shadow-[0_4px_0_#1e3a8a] active:shadow-[0_0px_0_#1e3a8a] active:translate-y-1 transition-all"
                >
                   Tutup & Lanjut 🚀
                </button>
              </div>
           </div>
        </div>
      )}
      
      {/* Card Modal (Soal) */}
      <CardModal
        show={showCard}
        card={currentCard}
        onAnswer={handleCardAnswer}
        onClose={() => {}} // Disabled close outside answer
        powerups={currentPlayer === 1 ? p1Powerups : p2Powerups}
        onUsePowerup={(type) => handleUsePowerup(currentPlayer, type)}
      />
      
      {/* Victory Screen */}
      <VictoryScreen
        show={gameOver}
        winner={winner}
        player1Score={player1Score}
        player2Score={player2Score}
        totalQuestions={totalQuestions}
        correctAnswers={correctAnswers}
        gameMode={gameMode}
        onPlayAgain={resetGame}
        onBackToMenu={() => navigate('/')}
      />
    </div>
  )
}

export default Game
