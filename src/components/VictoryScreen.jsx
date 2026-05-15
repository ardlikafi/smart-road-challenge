import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { gsap } from 'gsap'

const VictoryScreen = ({ 
  show, 
  winner, 
  player1Score, 
  player2Score, 
  totalQuestions, 
  correctAnswers, 
  gameMode,
  onPlayAgain,
  onBackToMenu 
}) => {
  const modalRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (show && modalRef.current) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      // Multiple confetti bursts
      const confettiInterval = setInterval(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        })
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        })
      }, 500)

      // Stop confetti after 5 seconds
      setTimeout(() => clearInterval(confettiInterval), 5000)

      // Animate modal
      gsap.fromTo(modalRef.current,
        {
          scale: 0,
          rotation: -180,
          opacity: 0
        },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 1,
          ease: "back.out(1.7)"
        }
      )

      // Animate content
      gsap.fromTo(contentRef.current,
        {
          y: -50,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.5,
          ease: "power2.out"
        }
      )
    }
  }, [show])

  if (!show) return null

  const getMotivationalMessage = () => {
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
    
    if (percentage >= 80) {
      return "Luar biasa! Kamu ahli lalu lintas! 🌟"
    } else if (percentage >= 60) {
      return "Hebat! Terus belajar tentang keselamatan! 🎯"
    } else if (percentage >= 40) {
      return "Bagus! Kamu sudah mulai paham! 📚"
    } else {
      return "Jangan menyerah! Coba lagi ya! 💪"
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
         style={{ background: 'radial-gradient(ellipse at center, rgba(30,10,60,0.95) 0%, rgba(0,0,0,0.98) 100%)' }}>
      
      {/* Dekorasi bintang-bintang latar */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['10%,15%','85%,10%','20%,80%','75%,75%','50%,5%','5%,50%','90%,55%'].map((pos, i) => (
          <div key={i} className="absolute text-yellow-300 animate-pulse"
            style={{ left: pos.split(',')[0], top: pos.split(',')[1], fontSize: `${10 + (i % 3) * 6}px`, animationDelay: `${i * 0.3}s` }}>
            ✦
          </div>
        ))}
      </div>

      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl flex flex-col"
      >
        {/* Badge header */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-yellow-900 font-black text-xl px-12 py-3 rounded-full shadow-[0_10px_30px_rgba(253,224,71,0.5)] border-4 border-yellow-100 whitespace-nowrap uppercase tracking-widest animate-bounce">
          🏆 VICTORY! 🏆
        </div>

        {/* Frame utama */}
        <div className="rounded-[2.5rem] p-[5px] shadow-[0_0_80px_rgba(234,179,8,0.5),0_0_120px_rgba(245,158,11,0.3)] flex flex-col overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #fef08a, #eab308, #ca8a04, #fef08a)' }}>
          <div ref={contentRef} className="bg-white/95 backdrop-blur-xl rounded-[2.3rem] p-8 md:p-10 flex flex-col relative overflow-hidden">
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

            <div className="text-center mb-8 relative z-10 mt-4">
              <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 drop-shadow-sm uppercase tracking-wider">
                {winner} Menang!
              </p>
            </div>

            {/* Score Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-3xl p-6 md:p-8 mb-8 border-2 border-blue-100 shadow-inner relative z-10">
              <h3 className="text-xl font-black text-center mb-6 text-indigo-800 uppercase tracking-widest flex items-center justify-center gap-2">
                <span className="text-2xl">📊</span> Laporan Hasil
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center bg-white p-4 rounded-2xl shadow-sm border border-blue-50">
                  <p className="text-lg font-bold text-gray-500 mb-1">Player 1</p>
                  <p className="text-4xl font-black text-blue-600 drop-shadow-sm">{player1Score}</p>
                  <p className="text-sm font-bold text-blue-300 uppercase tracking-wider mt-1">Poin</p>
                </div>
                
                {gameMode === 'multi' ? (
                  <div className="text-center bg-white p-4 rounded-2xl shadow-sm border border-pink-50">
                    <p className="text-lg font-bold text-gray-500 mb-1">Player 2</p>
                    <p className="text-4xl font-black text-pink-600 drop-shadow-sm">{player2Score}</p>
                    <p className="text-sm font-bold text-pink-300 uppercase tracking-wider mt-1">Poin</p>
                  </div>
                ) : (
                  <div className="text-center bg-white p-4 rounded-2xl shadow-sm border border-green-50 flex flex-col items-center justify-center">
                    <p className="text-lg font-bold text-gray-500 mb-1">Status</p>
                    <p className="text-2xl font-black text-green-500 drop-shadow-sm">Selesai</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 border border-indigo-50 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold">Total Soal Dijawab</span>
                  <span className="font-black text-xl text-gray-700">{totalQuestions}</span>
                </div>
                <div className="w-full h-px bg-gray-100"></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold">Jawaban Benar</span>
                  <span className="font-black text-xl text-green-500">{correctAnswers}</span>
                </div>
                <div className="w-full h-px bg-gray-100"></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold">Akurasi</span>
                  <span className="font-black text-2xl text-indigo-600">
                    {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Motivational Message */}
            <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl p-5 mb-8 border-2 border-yellow-200 shadow-sm relative z-10 text-center transform transition-transform hover:scale-105">
              <p className="text-xl font-black text-amber-700">
                {getMotivationalMessage()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button
                onClick={onPlayAgain}
                className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 shadow-xl border-b-4 border-green-700 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2"
              >
                <span className="text-2xl">🔄</span> Main Lagi
              </button>
              <button
                onClick={onBackToMenu}
                className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 shadow-xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2"
              >
                <span className="text-2xl">🏠</span> Ke Menu Utama
              </button>
            </div>
          </div>
        </div>
        
        {/* Corner stars dekoratif */}
        <div className="absolute -top-5 -left-5 text-5xl animate-spin z-20 pointer-events-none" style={{ animationDuration: '8s' }}>⭐</div>
        <div className="absolute -top-5 -right-5 text-5xl animate-spin z-20 pointer-events-none" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>🌟</div>
        <div className="absolute -bottom-5 -left-5 text-4xl animate-bounce z-20 pointer-events-none" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute -bottom-5 -right-5 text-4xl animate-bounce z-20 pointer-events-none" style={{ animationDelay: '0.2s' }}>✨</div>
      </div>
    </div>
  )
}

export default VictoryScreen
