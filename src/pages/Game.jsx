import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import GameBoardFinal from '../components/GameBoardFinal'
import PlayerPanel from '../components/PlayerPanel'
import CardModal from '../components/CardModal'
import VictoryScreen from '../components/VictoryScreen'
import HelpDeckModal from '../components/HelpDeckModal'
import LearningDeckModal from '../components/LearningDeckModal'
import questionsData from '../data/questions.json'
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'

// Import card assets for the deck
import cardStepImg from '../../assets/card_step.webp'
import cardChallengeImg from '../../assets/card_challenge.webp'
import cardLearningImg from '../../assets/card_learning.webp'
import cardHelpImg from '../../assets/card_help.webp'
import avatarImg from '../../assets/avatar.png'

// Bantuan Cards for Mystery Box
import bantuanPolisiImg from '../../assets/bantuan_polisi.webp'
import bantuanLampuImg from '../../assets/bantuan_lampu.webp'
import bantuanSkipImg from '../../assets/bantuan_skip.webp'

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
  
  // Fitur Baru: Kejadian & Streak
  const [eventPopup, setEventPopup] = useState(null)
  const [comboSplash, setComboSplash] = useState(null) // State untuk efek Combo 1x, 2x
  const [p1Streak, setP1Streak] = useState(0)
  const [p2Streak, setP2Streak] = useState(0)
  const [mapEvent, setMapEvent] = useState({ modifier: 0 })
  const [currentMapZone, setCurrentMapZone] = useState(0)
  
  // Modals for Decks
  const [showHelpDeckModal, setShowHelpDeckModal] = useState(false)
  const [showLearningDeckModal, setShowLearningDeckModal] = useState(false)

  // Discovered Cards
  const [discoveredCards, setDiscoveredCards] = useState(() => {
    const saved = localStorage.getItem('discoveredLearningCards');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Powerups (Bantuan) - Mulai dari 0 agar dicari lewat Kotak Misteri
  const [p1Powerups, setP1Powerups] = useState({ polisi: 0, lampu: 0, skip: 0 })
  const [p2Powerups, setP2Powerups] = useState({ polisi: 0, lampu: 0, skip: 0 })
  
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
  
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  
  useEffect(() => {
    setShuffledQuestions([...questionsData].sort(() => Math.random() - 0.5));
  }, []);

  const stepCardRef = useRef(null)
  const deckRef = useRef(null)
  const eventPopupRef = useRef(null)
  const comboRef = useRef(null) // Ref untuk animasi COMBO

  // Animasi untuk EventPopup
  useEffect(() => {
    if (eventPopup && eventPopupRef.current) {
      gsap.fromTo(eventPopupRef.current,
        { scale: 0.5, opacity: 0, rotation: -5, y: 50 },
        { scale: 1, opacity: 1, rotation: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.6)" }
      )
    }
  }, [eventPopup])

  // Animasi Brutal & Keren untuk Combo (Screen Shake + Massive Text)
  useEffect(() => {
    if (comboSplash > 0 && comboRef.current) {
      if (comboSplash > 1) {
        // Hanya shake jika combo > 1
        gsap.fromTo('.game-container',
          { x: -10, y: -10 },
          { x: 10, y: 10, duration: 0.05, yoyo: true, repeat: 11, clearProps: "all" }
        );
      }
      
      // Efek Slam Text Raksasa
      gsap.fromTo(comboRef.current,
        { scale: 3, opacity: 0, rotation: comboSplash > 1 ? 15 : -5 },
        { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: "bounce.out" }
      );
    }
  }, [comboSplash])

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
      const pts = mapPaths[m];
      const interpolatedPts = [];
      for (let i = 0; i < pts.length - 1; i++) {
        interpolatedPts.push(pts[i]);
        interpolatedPts.push({
          x: (pts[i].x + pts[i+1].x) / 2,
          y: (pts[i].y + pts[i+1].y) / 2
        });
      }
      interpolatedPts.push(pts[pts.length - 1]);

      for (let t = 0; t < interpolatedPts.length; t++) {
        const wp = interpolatedPts[t];
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
        let randomValue = Math.floor(Math.random() * 5) + 1
        
        // Modifikasi cuaca/event map
        if (mapEvent.modifier !== 0) {
           randomValue += mapEvent.modifier;
           if (randomValue < 1) randomValue = 1;
        }

        setDrawnNumber(randomValue)
        setNarrativeText(mapEvent.modifier !== 0 ? `Dadu ${randomValue - mapEvent.modifier} + Efek Map! Total: ${randomValue} Langkah!` : `Wah, dapat angka ${randomValue}! Ayo jalan!`)
        
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

        // Cek jenis tile saat LANDING melalui sistem baru
        setTimeout(() => {
          handleTileLanding(currentStep);
        }, 600)
      }
    }, 500) // 500ms per langkah — lebih smooth
  }, [currentPlayer, player1Position, player2Position, tileCoordinates.length, currentQuestionIndex, discoveredCards.length])

  // ==========================================
  // SISTEM EVENT: Ular Tangga, Kotak Misteri
  // ==========================================
  const handleTileLanding = (step) => {
    // 1. Cek Perpindahan Zona Map
    const zone = Math.floor(step / 19);
    let zoneChanged = false;
    if (zone > currentMapZone) {
       setCurrentMapZone(zone);
       zoneChanged = true;
    }

    const triggerTileEvent = (currentPos) => {
       setEventPopup(null); // Tutup popup map event jika ada
       
       // Ular Tangga: Shortcut
       if ([25, 65, 105, 142].includes(currentPos)) {
          playSfx(sfxSparkle);
          setEventPopup({ 
            type: 'shortcut', 
            title: 'JALAN PINTAS!', 
            highlight: 'MAJU 6 LANGKAH',
            desc: 'Kamu diajak naik Bus Sekolah! Meluncur cepat ke depan!', 
            icon: '🚌', 
            action: () => performBonusMove(6) 
          })
          return;
       }
       // Ular Tangga: Trap / Hukuman
       if ([45, 90, 135].includes(currentPos)) {
          playSfx(sfxWrong);
          setEventPopup({ 
            type: 'trap', 
            title: 'LAMPU MERAH!', 
            highlight: 'MUNDUR 3 LANGKAH',
            desc: 'Ada razia polisi dan lampu merah! Kamu terpaksa harus putar balik.', 
            icon: '🛑', 
            action: () => performBonusMove(-3) 
          })
          return;
       }
       
       // Kotak Misteri (15% peluang jika tidak ada event fixed)
       if (Math.random() < 0.15) {
          const powerupsList = ['polisi', 'lampu', 'skip'];
          const prize = powerupsList[Math.floor(Math.random() * powerupsList.length)];
          playSfx(sfxSparkle);
          setEventPopup({ 
            type: 'box', 
            title: 'KOTAK MISTERI!', 
            highlight: `KARTU ${prize.toUpperCase()}`,
            desc: `Gunakan kartu bantuan ini kapan saja untuk mempermudah permainan!`, 
            icon: prize, 
            action: () => awardPowerup(prize) 
          })
          return;
       }

       // Jika tidak ada special tile, cek trigger Kartu Soal / Belajar
       triggerQuestionOrLearning(currentPos);
    }

    if (zoneChanged) {
       // Munculkan Map Event
       const events = [
         { title: 'Hujan Badai 🌧️', desc: 'Jalanan licin dan banjir! Lemparan dadumu dikurangi 1 langkah di area ini.', mod: -1 },
         { title: 'Jalan Tol Sepi 🛣️', desc: 'Jalanan sangat lancar! Lemparan dadumu ditambah 1 langkah di area ini.', mod: 1 },
         { title: 'Cuaca Cerah ☀️', desc: 'Cuaca yang sangat bagus untuk melanjutkan perjalanan santai.', mod: 0 }
       ];
       const ev = events[Math.floor(Math.random() * events.length)];
       setMapEvent({ modifier: ev.mod });
       setEventPopup({ 
         type: 'map', 
         title: ev.title, 
         highlight: 'CUACA BERUBAH',
         desc: ev.desc, 
         icon: '🌍', 
         action: () => triggerTileEvent(step) 
       });
    } else {
       triggerTileEvent(step);
    }
  }

  const performBonusMove = (steps) => {
    setEventPopup(null);
    const currentPos = currentPlayer === 1 ? player1Position : player2Position;
    const newPos = Math.max(0, Math.min(currentPos + steps, tileCoordinates.length - 1));
    
    if (currentPlayer === 1) setPlayer1Position(newPos);
    else setPlayer2Position(newPos);
    
    setTimeout(() => {
       if (newPos >= tileCoordinates.length - 1) {
          setGameOver(true); setWinner(currentPlayer);
       } else {
          finishTurn();
       }
    }, 1000);
  }

  const awardPowerup = (type) => {
    if (currentPlayer === 1) setP1Powerups(p => ({...p, [type]: p[type] + 1}));
    else setP2Powerups(p => ({...p, [type]: p[type] + 1}));
    setEventPopup(null);
    finishTurn();
  }

  const triggerQuestionOrLearning = (step) => {
    const hasMoreQuestions = currentQuestionIndex < shuffledQuestions.length;
    const hasMoreBelajar = discoveredCards.length < 7;
    
    if (Math.random() < 0.65 && (hasMoreQuestions || hasMoreBelajar)) {
      let showType = 'question';
      if (hasMoreQuestions && hasMoreBelajar) {
        showType = Math.random() < 0.7 ? 'question' : 'belajar';
      } else if (hasMoreBelajar) {
        showType = 'belajar';
      }
      
      if (showType === 'question') {
        const qIndex = currentQuestionIndex;
        setCurrentCard(shuffledQuestions[qIndex]);
        setShowCard(true);
        setNarrativeText('Siap-siap, jawab tantangan ini dengan benar ya!');
      } else {
        const undiscovered = [1,2,3,4,5,6,7].filter(id => !discoveredCards.includes(id));
        const randomId = undiscovered[Math.floor(Math.random() * undiscovered.length)];
        setCurrentBelajarId(randomId);
        
        setDiscoveredCards(prev => {
          if (!prev.includes(randomId)) {
            const updated = [...prev, randomId];
            localStorage.setItem('discoveredLearningCards', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });

        setShowBelajar(true);
        setNarrativeText('Wah, ada info baru! Kartu Belajar ditemukan!');
        playSfx(sfxSparkle);
      }
    } else if (!hasMoreQuestions && !hasMoreBelajar && step % 4 === 0) {
       const qIndex = Math.floor(Math.random() * shuffledQuestions.length);
       setCurrentCard(shuffledQuestions[qIndex]);
       setShowCard(true);
       setNarrativeText('Tantangan bonus!');
    } else {
      finishTurn();
    }
  }

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
    let newStreak = 0;

    if (isCorrect) {
      newStreak = (currentPlayer === 1 ? p1Streak : p2Streak) + 1;

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
        setP1Streak(newStreak);
      } else {
        setPlayer2Score(prev => prev + 10)
        setP2Streak(newStreak);
      }
      playSfx(sfxCorrect);
      
      // Munculkan tulisan Combo Splash di tengah layar
      setComboSplash(newStreak);
      setTimeout(() => setComboSplash(null), 2000);

    } else {
      playSfx(sfxWrong);
      if (currentPlayer === 1) setP1Streak(0); else setP2Streak(0);
    }
    
    setTotalQuestions(prev => prev + 1)
    setCurrentQuestionIndex(prev => prev + 1)
    setShowCard(false)
    setCurrentCard(null)

    // Cek jika mencapai Streak 3
    if (isCorrect && newStreak === 3) {
       if (currentPlayer === 1) setP1Streak(0); else setP2Streak(0);
       setTimeout(() => {
         setEventPopup({ 
           type: 'streak', 
           title: 'COMBO 3X! 🔥', 
           highlight: '+20 POIN EKSTRA',
           desc: 'Hebat! Kamu menjawab benar 3 kali berturut-turut! Dapatkan juga 1 Kartu Bantuan acak!', 
           icon: '🔥', 
           action: () => {
              if (currentPlayer === 1) setPlayer1Score(p => p + 20); else setPlayer2Score(p => p + 20);
              awardPowerup(['polisi', 'lampu', 'skip'][Math.floor(Math.random() * 3)]);
           }
         });
       }, 2200); // Tunggu animasi combo selesai
    } else if (isCorrect) {
       // Beri jeda agar pemain bisa menikmati layar Combo/Benar sebelum giliran berakhir
       setTimeout(() => {
          finishTurn();
       }, 1800);
    } else {
       finishTurn();
    }
  }, [currentPlayer, p1Streak, p2Streak])

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

  const weatherType = mapEvent.modifier === -1 ? 'rain' : mapEvent.modifier === 1 ? 'clear' : 'normal';

  return (
    <div className={`game-container relative w-screen h-screen overflow-hidden transition-colors duration-1000 ${weatherType === 'rain' ? 'bg-slate-700' : 'bg-sky-200'}`}>
      <GameBoardFinal
        player1Position={player1Position}
        player2Position={player2Position}
        gameMode={gameMode}
        tileCoordinates={tileCoordinates}
        player1Pion={player1Pion}
        player2Pion={player2Pion}
        showDebug={showDebug}
        weatherType={weatherType}
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
          streak={p1Streak}
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
            streak={p2Streak}
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
        <div className="absolute top-[6.5rem] md:top-16 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 border-4 border-white rounded-full px-6 py-1.5 shadow-xl z-40 font-bold text-sm md:text-lg animate-bounce whitespace-nowrap">
          {gameMode === 'multi' 
            ? `Giliran ${currentPlayer === 1 ? player1Name : player2Name}`
            : `Jalan Terus, ${player1Name}!`
          }
        </div>
      )}
      
      {/* Deck Kartu */}
      {!showDebug && (
      <div ref={deckRef} className="absolute bottom-4 md:bottom-10 left-1/2 transform -translate-x-1/2 flex items-end space-x-2 md:space-x-4 z-40">
        {/* Kartu sampingan */}
        <div 
           className="relative cursor-pointer deck-card transition-transform hover:-translate-y-2 md:hover:-translate-y-4 group"
           onClick={() => !isRolling && !isPlayerMoving && !isDeterminingFirst && setShowHelpDeckModal(true)}
        >
           <div className="absolute -top-6 md:-top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 md:px-3 py-1 rounded-full text-[9px] md:text-xs font-bold text-green-600 shadow-md whitespace-nowrap opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
             Bantuan
           </div>
           <img src={cardHelpImg} alt="Help" className="w-[4.5rem] h-[6.5rem] md:w-24 md:h-36 object-cover rounded-xl md:rounded-2xl shadow-xl border-[3px] md:border-4 border-green-400" />
        </div>
        <div 
           className="relative cursor-pointer deck-card transition-transform hover:-translate-y-2 md:hover:-translate-y-4 group"
           onClick={() => !isRolling && !isPlayerMoving && !isDeterminingFirst && setShowLearningDeckModal(true)}
        >
           <div className="absolute -top-6 md:-top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 md:px-3 py-1 rounded-full text-[9px] md:text-xs font-bold text-blue-600 shadow-md whitespace-nowrap opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
             Koleksi
           </div>
           <img src={cardLearningImg} alt="Learning" className="w-[4.5rem] h-[6.5rem] md:w-24 md:h-36 object-cover rounded-xl md:rounded-2xl shadow-xl border-[3px] md:border-4 border-blue-400" />
        </div>
        
        {/* Kartu Langkah (Interaktif) */}
        <div
          className={`relative cursor-pointer transition-transform hover:-translate-y-2 ${isRolling || isPlayerMoving || isDeterminingFirst ? 'pointer-events-none' : ''}`}
          onClick={drawStepCard}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-bold text-blue-600 shadow-md whitespace-nowrap animate-pulse">
            Tekan!
          </div>
          <div ref={stepCardRef} className="relative w-20 h-28 md:w-32 md:h-48 perspective-1000">
            {drawnNumber ? (
              <div className="w-full h-full bg-white rounded-xl shadow-2xl border-[3px] md:border-4 border-blue-500 flex flex-col items-center justify-center">
                 <span className="text-[8px] md:text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Dapat</span>
                 <span className="text-4xl md:text-6xl font-black text-blue-600 drop-shadow-md my-1">{drawnNumber}</span>
                 <span className="text-[9px] md:text-sm font-bold text-gray-500 uppercase tracking-widest leading-none">Langkah</span>
              </div>
            ) : (
              <img src={cardStepImg} alt="Step Card" className="w-full h-full object-cover rounded-xl shadow-2xl border-[3px] md:border-2 border-white" />
            )}
          </div>
        </div>

      </div>
      )}

      {/* COMBO SPLASH ANIMATION (Screen Shake Brutal Effect) */}
      {comboSplash > 0 && (
        <div className="fixed inset-0 z-[110] pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div ref={comboRef} className="relative flex flex-col items-center justify-center">
            {/* Background Glow */}
            <div className={`absolute inset-0 blur-[100px] opacity-60 rounded-full w-full h-full scale-150 ${comboSplash > 1 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            
            {/* Main Text */}
            <h1 className={`text-[8rem] md:text-[14rem] font-black italic tracking-tighter text-transparent bg-clip-text drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] leading-none z-20 ${comboSplash > 1 ? 'bg-gradient-to-b from-yellow-200 via-orange-400 to-red-600' : 'bg-gradient-to-b from-green-300 via-emerald-400 to-green-600'}`}>
              {comboSplash > 1 ? `${comboSplash}X` : 'BENAR!'}
            </h1>
            
            {/* Emoji Latar */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[25rem] opacity-40 z-10 animate-pulse">
              {comboSplash > 1 ? '🔥' : '✨'}
            </div>
            
            {comboSplash > 1 && (
              <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-widest drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] -mt-8 md:-mt-16 z-30 animate-bounce">
                COMBO!
              </h2>
            )}
          </div>
        </div>
      )}

      {/* Narrative Box (Chat Bubble Premium) */}
      {!showDebug && (
      <div className="absolute bottom-32 md:bottom-10 right-4 md:right-10 z-50 pointer-events-none flex flex-col items-end">
        {/* Chat Bubble Tail */}
        <div className="bg-white/95 backdrop-blur-xl p-4 md:p-5 rounded-[2rem] rounded-br-md shadow-[0_10px_40px_rgba(0,0,0,0.3)] border-[3px] border-blue-400 w-64 md:w-80 mb-2 relative transform transition-all hover:scale-105">
           <div className="absolute -bottom-[14px] right-6 w-0 h-0 border-l-[12px] border-l-transparent border-t-[14px] border-t-blue-400 border-r-[12px] border-r-transparent"></div>
           <div className="absolute -bottom-[9px] right-[26px] w-0 h-0 border-l-[10px] border-l-transparent border-t-[11px] border-t-white border-r-[10px] border-r-transparent"></div>
           <p className="text-gray-800 font-bold text-xs md:text-sm leading-relaxed italic text-center">"{narrativeText}"</p>
        </div>
        
        {/* Avatar Area */}
        <div className="flex items-center gap-3 pr-2 mt-1">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg uppercase tracking-widest border border-blue-300">
             Sistem Navigasi
          </div>
          <div className="bg-blue-100 rounded-full p-1 border-[3px] border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] flex-shrink-0 relative">
             <img src={avatarImg} alt="Avatar" className="w-10 h-10 md:w-14 md:h-14 object-cover rounded-full" />
          </div>
        </div>
      </div>
      )}

      {/* EVENT POPUP MODAL (Premium UI & UX) */}
      {eventPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'radial-gradient(ellipse at center, rgba(10,10,40,0.85) 0%, rgba(0,0,0,0.95) 100%)' }}>
          
          {/* Efek Bintang Latar (Khusus selain trap) */}
          {eventPopup.type !== 'trap' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {['10%,15%','85%,10%','20%,80%','75%,75%','50%,5%','5%,50%','90%,55%'].map((pos, i) => (
                <div key={i} className="absolute text-yellow-300 animate-pulse"
                  style={{ left: pos.split(',')[0], top: pos.split(',')[1], fontSize: `${10 + (i % 3) * 6}px`, animationDelay: `${i * 0.3}s` }}>
                  ✦
                </div>
              ))}
            </div>
          )}

          <div ref={eventPopupRef} className="relative w-full max-w-md">
            {/* Badge Header Mengambang */}
            <div className={`absolute -top-5 left-1/2 -translate-x-1/2 z-20 font-black text-sm px-6 py-2 rounded-full shadow-xl border-2 whitespace-nowrap tracking-widest
                 ${eventPopup.type === 'trap' ? 'bg-gradient-to-r from-red-500 to-red-700 text-white border-red-300' :
                   eventPopup.type === 'shortcut' ? 'bg-gradient-to-r from-emerald-400 to-green-600 text-white border-green-200' :
                   eventPopup.type === 'streak' ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-orange-200' :
                   eventPopup.type === 'box' ? 'bg-gradient-to-r from-blue-400 to-indigo-600 text-white border-blue-200' :
                   'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white border-purple-300'
                 }`}>
              {eventPopup.type === 'box' ? '🎁 KOTAK MISTERI 🎁' : 
               eventPopup.type === 'trap' ? '⚠️ PERINGATAN ⚠️' : 
               eventPopup.type === 'shortcut' ? '🚀 KEJUTAN! 🚀' : 
               `⭐ ${eventPopup.title} ⭐`}
            </div>

            {/* Frame Utama (Premium Glow) */}
            <div className="rounded-[2.5rem] p-[4px] shadow-[0_0_80px_rgba(0,0,0,0.5)]"
              style={{ background: eventPopup.type === 'trap' ? 'linear-gradient(135deg, #ef4444, #7f1d1d, #ef4444)' :
                                   eventPopup.type === 'shortcut' ? 'linear-gradient(135deg, #10b981, #064e3b, #10b981)' :
                                   eventPopup.type === 'streak' ? 'linear-gradient(135deg, #f59e0b, #78350f, #f59e0b)' :
                                   'linear-gradient(135deg, #3b82f6, #6366f1, #3b82f6)' }}>
              <div className="bg-white rounded-[2.35rem] overflow-hidden flex flex-col items-center p-8 text-center relative">
                
                {/* Visual Icon / Gambar Besar Tengah */}
                <div className="mt-8 mb-6 relative">
                   {/* Glow Background di belakang icon */}
                   <div className={`absolute inset-0 blur-2xl opacity-40 rounded-full scale-150 ${eventPopup.type === 'trap' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                   
                   {eventPopup.type === 'box' ? (
                     <img 
                       src={eventPopup.icon === 'polisi' ? bantuanPolisiImg : eventPopup.icon === 'lampu' ? bantuanLampuImg : bantuanSkipImg} 
                       alt="Powerup" 
                       className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl relative z-10 transition-transform duration-1000 animate-[bounce_3s_infinite]"
                     />
                   ) : (
                     <div className="text-8xl md:text-9xl drop-shadow-2xl relative z-10 animate-[pulse_2s_infinite]">{eventPopup.icon}</div>
                   )}
                </div>

                {/* Teks Hierarki Jelas */}
                {eventPopup.type === 'box' && (
                  <p className="text-gray-500 font-black mb-1 uppercase tracking-widest text-xs md:text-sm">KAMU MENDAPATKAN:</p>
                )}

                {/* HIGHLIGHT TEXT (Super Besar & Jelas untuk UX) */}
                <h2 className={`text-3xl md:text-4xl font-black mb-4 uppercase tracking-wider leading-tight drop-shadow-sm
                    ${eventPopup.type === 'trap' ? 'text-red-600' :
                      eventPopup.type === 'shortcut' ? 'text-emerald-600' :
                      eventPopup.type === 'streak' ? 'text-orange-600' :
                      eventPopup.type === 'box' ? 'text-blue-700' : 'text-purple-700'}`}>
                  {eventPopup.highlight}
                </h2>

                <p className="text-gray-600 font-semibold text-base md:text-lg mb-8 leading-relaxed px-2">
                  {eventPopup.desc}
                </p>

                {/* Tombol Lanjut Premium */}
                <button
                  onClick={() => eventPopup.action()}
                  className={`w-full py-4 rounded-2xl font-black text-white text-xl shadow-xl transition-all hover:scale-105 active:scale-95 border-b-4 
                    ${eventPopup.type === 'trap' ? 'bg-gradient-to-r from-red-500 to-red-600 border-red-800 hover:shadow-red-500/50' : 
                      eventPopup.type === 'shortcut' ? 'bg-gradient-to-r from-emerald-400 to-green-500 border-green-700 hover:shadow-green-500/50' : 
                      eventPopup.type === 'streak' ? 'bg-gradient-to-r from-orange-400 to-orange-500 border-orange-700 hover:shadow-orange-500/50' : 
                      'bg-gradient-to-r from-blue-400 to-blue-600 border-blue-800 hover:shadow-blue-500/50'}`}
                >
                  {eventPopup.type === 'map' ? 'SIAP MELUNCUR! 🚀' : 'OKE, MANTAP! 👍'}
                </button>
              </div>
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
      
      <HelpDeckModal show={showHelpDeckModal} onClose={() => setShowHelpDeckModal(false)} />
      <LearningDeckModal show={showLearningDeckModal} onClose={() => setShowLearningDeckModal(false)} discoveredCards={discoveredCards} />
      
      <VictoryScreen show={gameOver} winner={winner === 1 ? player1Name : player2Name} player1Score={player1Score} player2Score={player2Score} totalQuestions={totalQuestions} correctAnswers={correctAnswers} gameMode={gameMode} onPlayAgain={resetGame} onBackToMenu={() => navigate('/')} />
    </div>
  )
}

export default Game
