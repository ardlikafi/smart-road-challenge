import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'

import mapOpeningImg from '../../assets/map_opening.webp'
import pionBoyImg from '../../assets/pion_boy.webp'
import pionGirlImg from '../../assets/pion_girl.webp'
import ceweAdatImg from '../../assets/tile_ceweadat.webp'
import cowoAdatImg from '../../assets/tile_cowoadat.webp'
import superwomanImg from '../../assets/tile_superwoman.webp'

const PlayerSetup = () => {
  const navigate = useNavigate()
  const [gameMode, setGameMode] = useState('single')
  const [player1Name, setPlayer1Name] = useState('')
  const [player2Name, setPlayer2Name] = useState('')
  const [player1Pion, setPlayer1Pion] = useState('boy')
  const [player2Pion, setPlayer2Pion] = useState('girl')
  const containerRef = useRef(null)

  useEffect(() => {
    const mode = localStorage.getItem('gameMode')
    setGameMode(mode || 'single')
    
    // Animate enter
    gsap.fromTo(containerRef.current,
      { scale: 0.8, opacity: 0, y: 50 },
      { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "elastic.out(1, 0.6)" }
    )
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!player1Name.trim()) {
      alert('Player 1 nama harus diisi!')
      return
    }
    
    if (gameMode === 'multi' && !player2Name.trim()) {
      alert('Player 2 nama harus diisi!')
      return
    }
    
    localStorage.setItem('player1Name', player1Name.trim())
    localStorage.setItem('player1Pion', player1Pion)
    
    if (gameMode === 'multi') {
      localStorage.setItem('player2Name', player2Name.trim())
      localStorage.setItem('player2Pion', player2Pion)
    }
    
    // Animate exit
    gsap.to(containerRef.current, {
      scale: 0.9, opacity: 0, y: -50, duration: 0.4, ease: "power2.in",
      onComplete: () => navigate('/game')
    })
  }

  const handleBack = () => {
    gsap.to(containerRef.current, {
      scale: 0.9, opacity: 0, y: 50, duration: 0.4, ease: "power2.in",
      onComplete: () => navigate('/')
    })
  }

  const pions = [
    { id: 'boy', img: pionBoyImg, label: 'BOY' },
    { id: 'girl', img: pionGirlImg, label: 'GIRL' },
    { id: 'cowoadat', img: cowoAdatImg, label: 'COWO ADAT' },
    { id: 'ceweadat', img: ceweAdatImg, label: 'CEWE ADAT' },
    { id: 'superwoman', img: superwomanImg, label: 'SUPERHERO' }
  ]

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start relative font-nunito p-4 overflow-y-auto"
         style={{ backgroundImage: `url(${mapOpeningImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      
      {/* Dark overlay with animated gradient */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0 fixed"></div>
      
      {/* Decorative stars */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {['10%,15%','85%,10%','20%,80%','75%,75%','50%,5%','5%,50%','90%,55%'].map((pos, i) => (
          <div key={i} className="absolute text-white/50 animate-pulse"
            style={{ left: pos.split(',')[0], top: pos.split(',')[1], fontSize: `${10 + (i % 3) * 6}px`, animationDelay: `${i * 0.3}s` }}>
            ✦
          </div>
        ))}
      </div>

      <div ref={containerRef} className="relative z-10 w-full max-w-2xl py-8 mt-10 md:my-auto">
        
        {/* Floating Header */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white font-black text-xl md:text-2xl px-12 py-3 rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.5)] border-4 border-white whitespace-nowrap uppercase tracking-widest animate-bounce">
          {gameMode === 'single' ? '🚀 Misi Solo 🚀' : '👥 Duel Seru 👥'}
        </div>

        {/* Frame utama */}
        <div className="rounded-[2.5rem] p-[4px] shadow-[0_0_60px_rgba(59,130,246,0.6)] flex flex-col"
             style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)' }}>
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.3rem] p-6 md:p-10 flex flex-col items-center w-full">
            
            <form onSubmit={handleSubmit} className="w-full mt-4 flex flex-col gap-6">
              
              {/* Player 1 Card */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 md:p-8 border-2 border-blue-200 shadow-md transform transition-all hover:shadow-lg relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                
                <label className="flex items-center gap-3 text-xl md:text-2xl font-black text-blue-800 mb-4 uppercase tracking-wide">
                  <span className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-inner">1</span>
                  Nama Player 1
                </label>
                <input
                  type="text"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="Siapa namamu?"
                  className="w-full p-4 bg-white/80 border-4 border-blue-200 focus:border-blue-500 rounded-2xl font-bold text-xl text-blue-900 outline-none transition-all shadow-inner placeholder-blue-300 mb-6 focus:ring-4 ring-blue-100"
                  maxLength={15}
                  required
                />
                
                <p className="text-sm font-bold text-blue-500 mb-4 uppercase tracking-widest text-center">Pilih Karaktermu</p>
                <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
                  {pions.map(pion => (
                    <div 
                      key={pion.id}
                      onClick={() => setPlayer1Pion(pion.id)}
                      className={`cursor-pointer p-3 rounded-2xl border-4 transition-all duration-300 transform ${player1Pion === pion.id ? 'border-blue-500 bg-white scale-110 shadow-xl -translate-y-2' : 'border-transparent bg-white/50 hover:bg-white hover:scale-105'}`}
                    >
                      <img src={pion.img} alt={pion.label} className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-md" />
                      <p className={`text-center mt-2 font-black text-[10px] md:text-xs ${player1Pion === pion.id ? 'text-blue-600' : 'text-gray-400'}`}>{pion.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player 2 Card */}
              {gameMode === 'multi' && (
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-6 md:p-8 border-2 border-pink-200 shadow-md transform transition-all hover:shadow-lg relative overflow-hidden group mt-2">
                  <div className="absolute -left-10 -top-10 w-32 h-32 bg-pink-400 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  
                  <label className="flex items-center gap-3 text-xl md:text-2xl font-black text-pink-800 mb-4 uppercase tracking-wide">
                    <span className="bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-inner">2</span>
                    Nama Player 2
                  </label>
                  <input
                    type="text"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    placeholder="Siapa namamu?"
                    className="w-full p-4 bg-white/80 border-4 border-pink-200 focus:border-pink-500 rounded-2xl font-bold text-xl text-pink-900 outline-none transition-all shadow-inner placeholder-pink-300 mb-6 focus:ring-4 ring-pink-100"
                    maxLength={15}
                    required
                  />
                  
                  <p className="text-sm font-bold text-pink-500 mb-4 uppercase tracking-widest text-center">Pilih Karaktermu</p>
                  <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
                    {pions.map(pion => (
                      <div 
                        key={pion.id}
                        onClick={() => setPlayer2Pion(pion.id)}
                        className={`cursor-pointer p-3 rounded-2xl border-4 transition-all duration-300 transform ${player2Pion === pion.id ? 'border-pink-500 bg-white scale-110 shadow-xl -translate-y-2' : 'border-transparent bg-white/50 hover:bg-white hover:scale-105'}`}
                      >
                        <img src={pion.img} alt={pion.label} className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-md" />
                        <p className={`text-center mt-2 font-black text-[10px] md:text-xs ${player2Pion === pion.id ? 'text-pink-600' : 'text-gray-400'}`}>{pion.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-600 px-6 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 shadow-md border-b-4 border-gray-400 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2"
                >
                  ◀ KEMBALI
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-xl md:text-2xl transition-all transform hover:scale-105 shadow-xl border-b-4 border-green-700 active:border-b-0 active:translate-y-1 tracking-wider flex items-center justify-center gap-3"
                >
                  MULAI GAME! <span className="text-3xl animate-pulse">🎲</span>
                </button>
              </div>

            </form>
          </div>
        </div>
        
        {/* Corner stars dekoratif */}
        <div className="absolute -top-3 -left-3 text-4xl animate-spin z-20 pointer-events-none" style={{ animationDuration: '8s' }}>⭐</div>
        <div className="absolute -top-3 -right-3 text-4xl animate-spin z-20 pointer-events-none" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>🌟</div>
        <div className="absolute -bottom-3 -left-3 text-3xl animate-bounce z-20 pointer-events-none" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute -bottom-3 -right-3 text-3xl animate-bounce z-20 pointer-events-none" style={{ animationDelay: '0.2s' }}>✨</div>
      </div>
    </div>
  )
}

export default PlayerSetup
