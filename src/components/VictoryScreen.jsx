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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl p-8 max-w-2xl mx-4 relative overflow-hidden"
      >
        {/* Victory Background Image */}
        <img 
          src="/assets/ui_victory.png" 
          alt="Victory"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        
        <div ref={contentRef} className="relative z-10">
          {/* Victory Header */}
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-yellow-600 mb-2">
              🎉 VICTORY! 🎉
            </h2>
            <p className="text-2xl text-gray-800">
              Player {winner} Menang!
            </p>
          </div>

          {/* Score Summary */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-center mb-4 text-blue-800">
              📊 Laporan Belajar
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700">Player 1</p>
                <p className="text-3xl font-bold text-blue-600">{player1Score}</p>
                <p className="text-sm text-gray-600">poin</p>
              </div>
              
              {gameMode === 'multi' && (
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-700">Player 2</p>
                  <p className="text-3xl font-bold text-pink-600">{player2Score}</p>
                  <p className="text-sm text-gray-600">poin</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Total Soal Dijawab:</span>
                <span className="font-bold">{totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Jawaban Benar:</span>
                <span className="font-bold text-green-600">{correctAnswers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Tingkat Keberhasilan:</span>
                <span className="font-bold text-blue-600">
                  {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <p className="text-center text-lg font-medium text-yellow-800">
              {getMotivationalMessage()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={onPlayAgain}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-colors transform hover:scale-105"
            >
              🔄 Main Lagi
            </button>
            <button
              onClick={onBackToMenu}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-colors transform hover:scale-105"
            >
              🏠 Kembali ke Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VictoryScreen
