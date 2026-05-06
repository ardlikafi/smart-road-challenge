import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

const Dice = ({ value, isRolling, onRoll, disabled = false }) => {
  const diceRef = useRef(null)
  const dotsContainerRef = useRef(null)

  useEffect(() => {
    if (isRolling && diceRef.current) {
      // Animasi dadu berputar
      gsap.to(diceRef.current, {
        rotation: '+=360',
        duration: 0.5,
        repeat: 3,
        ease: "power2.inOut"
      })
      
      // Animasi container dots
      if (dotsContainerRef.current) {
        gsap.to(dotsContainerRef.current, {
          scale: 0,
          opacity: 0.3,
          duration: 0.1,
          repeat: 6,
          yoyo: true,
          ease: "power2.inOut"
        })
      }
    }
  }, [isRolling])

  useEffect(() => {
    if (!isRolling && dotsContainerRef.current) {
      gsap.set(dotsContainerRef.current, {
        scale: 1,
        opacity: 1
      })
    }
  }, [isRolling, value])

  const renderDiceDots = (value) => {
    const dotPositions = {
      1: [{ x: 50, y: 50 }],
      2: [{ x: 30, y: 30 }, { x: 70, y: 70 }],
      3: [{ x: 30, y: 30 }, { x: 50, y: 50 }, { x: 70, y: 70 }],
      4: [{ x: 30, y: 30 }, { x: 70, y: 30 }, { x: 30, y: 70 }, { x: 70, y: 70 }],
      5: [{ x: 30, y: 30 }, { x: 70, y: 30 }, { x: 50, y: 50 }, { x: 30, y: 70 }, { x: 70, y: 70 }],
      6: [{ x: 30, y: 25 }, { x: 70, y: 25 }, { x: 30, y: 50 }, { x: 70, y: 50 }, { x: 30, y: 75 }, { x: 70, y: 75 }]
    }
    
    return dotPositions[value] || []
  }

  return (
    <div className="flex flex-col items-center">
      <button
        ref={diceRef}
        onClick={onRoll}
        disabled={disabled || isRolling}
        className="relative disabled:opacity-50 transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
      >
        <img 
          src="/assets/dice_blank.png" 
          alt="Dice"
          className="w-20 h-20 md:w-24 md:h-24"
        />
        <div 
          ref={dotsContainerRef}
          className="absolute inset-0 flex flex-wrap justify-center items-center p-3"
        >
          {renderDiceDots(value).map((dot, index) => (
            <div
              key={index}
              className="absolute w-3 h-3 md:w-4 md:h-4 bg-red-600 rounded-full shadow-lg"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>
      </button>
      
      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className="mt-2 disabled:opacity-50 transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
      >
        <img 
          src="/assets/btn_roll.png" 
          alt="Roll Dice"
          className="w-28 h-14 md:w-32 md:h-16"
        />
      </button>
    </div>
  )
}

export default Dice
