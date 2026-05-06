import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'

const DiceFinal = ({ value, isRolling, onRoll, disabled = false }) => {
  const diceRef = useRef(null)
  const [currentDiceFace, setCurrentDiceFace] = useState(1)

  useEffect(() => {
    if (isRolling && diceRef.current) {
      // Create rolling animation sequence
      const rollSequence = gsap.timeline()
      
      // Fast rolling animation dengan random faces
      for (let i = 0; i < 12; i++) {
        rollSequence.to(diceRef.current, {
          rotation: '+=360',
          duration: 0.08,
          ease: "none",
          onStart: () => {
            // Show random dice faces during roll
            const randomFace = Math.floor(Math.random() * 6) + 1
            setCurrentDiceFace(randomFace)
          }
        })
      }
      
      // Final reveal dengan correct value
      rollSequence.to(diceRef.current, {
        rotation: '+=360',
        duration: 0.2,
        ease: "power2.out",
        onComplete: () => {
          setCurrentDiceFace(value)
        }
      })
    } else {
      setCurrentDiceFace(value)
    }
  }, [isRolling, value])

  const handleRoll = () => {
    if (!disabled && !isRolling && onRoll) {
      onRoll()
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        ref={diceRef}
        onClick={handleRoll}
        disabled={disabled || isRolling}
        className="relative disabled:opacity-50 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 mb-4"
      >
        <img 
          src={`/assets/dice_${currentDiceFace}.png`}
          alt={`Dice showing ${currentDiceFace}`}
          className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-lg"
        />
      </button>
      
      <button
        onClick={handleRoll}
        disabled={disabled || isRolling}
        className="relative disabled:opacity-50 transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
      >
        <img 
          src="/assets/btn_roll.png" 
          alt="Roll Dice"
          className="w-28 h-14 md:w-32 md:h-16 object-contain filter drop-shadow-lg"
        />
      </button>
    </div>
  )
}

export default DiceFinal
