import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// Import Pion untuk Avatar
import pionBoyImg from '../../assets/pion_boy.webp'
import pionGirlImg from '../../assets/pion_girl.webp'
import ceweAdatImg from '../../assets/tile_ceweadat.webp'
import cowoAdatImg from '../../assets/tile_cowoadat.webp'
import superwomanImg from '../../assets/tile_superwoman.webp'

const PlayerPanel = ({ playerNumber, playerName, score, position, isActive, isFlipped = false, pionType = 'boy' }) => {
  const scoreRef = useRef(null)

  // Animasi saat skor bertambah
  useEffect(() => {
    if (scoreRef.current && score > 0) {
      gsap.fromTo(scoreRef.current, 
        { scale: 2, color: '#fef08a' }, 
        { scale: 1, color: 'inherit', duration: 0.6, ease: 'elastic.out(1, 0.3)' }
      )
    }
  }, [score])

  const panelColors = {
    1: {
      bg: 'from-blue-600/90 to-blue-800/90',
      border: 'border-blue-400/50',
      text: 'text-white',
      active: 'bg-yellow-400 text-blue-900 shadow-[0_0_20px_rgba(250,204,21,0.9)] ring-4 ring-yellow-200'
    },
    2: {
      bg: 'from-pink-600/90 to-pink-800/90', 
      border: 'border-pink-400/50',
      text: 'text-white',
      active: 'bg-yellow-400 text-pink-900 shadow-[0_0_20px_rgba(250,204,21,0.9)] ring-4 ring-yellow-200'
    }
  }
  
  const colors = panelColors[playerNumber] || panelColors[1]
  const getAvatarImg = (type) => {
    switch(type) {
      case 'boy': return pionBoyImg;
      case 'girl': return pionGirlImg;
      case 'cowoadat': return cowoAdatImg;
      case 'ceweadat': return ceweAdatImg;
      case 'superwoman': return superwomanImg;
      default: return pionBoyImg;
    }
  };
  const avatarImg = getAvatarImg(pionType);
  
  return (
    <div className={`relative flex items-center ${isFlipped ? 'flex-row-reverse' : 'flex-row'} gap-4 bg-gradient-to-r ${colors.bg} backdrop-blur-md ${colors.border} border-2 border-b-4 border-r-4 rounded-[2rem] shadow-2xl px-5 py-3 ${isActive ? 'scale-110 transition-transform z-50' : 'opacity-80 scale-100 transition-transform z-40 grayscale-[20%]'}`}>
       
       {/* Avatar Character */}
       <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex-shrink-0 flex items-center justify-center shadow-inner overflow-hidden border-2 border-white/50 bg-gradient-to-b from-white/40 to-transparent ${isActive ? colors.active : ''}`}>
          <img src={avatarImg} alt="Avatar" className="w-[120%] h-[120%] object-cover object-top" />
       </div>

       {/* Info Box */}
       <div className={`flex flex-col ${isFlipped ? 'text-right' : 'text-left'}`}>
          <span className={`text-base md:text-lg font-black tracking-widest drop-shadow-md uppercase ${colors.text}`}>
            {playerName || `Player ${playerNumber}`}
          </span>
          <div className={`flex items-center gap-2 mt-2 ${isFlipped ? 'justify-end' : 'justify-start'}`}>
             {/* Score Badge */}
             <div className="flex items-center bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 px-3 md:px-4 py-1 rounded-full shadow-[0_4px_10px_rgba(250,204,21,0.6)] border-2 border-yellow-100 transform hover:scale-105 transition-all">
               <span className="text-sm md:text-lg drop-shadow-md mr-1.5">🌟</span>
               <span ref={scoreRef} className="text-xs md:text-sm font-black text-yellow-900 tabular-nums drop-shadow-sm">{score} PTS</span>
             </div>
             
             {/* Position Badge */}
             <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full shadow-inner border border-white/30">
               <span className="text-sm mr-1.5">📍</span>
               <span className={`text-xs md:text-sm font-bold ${colors.text} tabular-nums`}>Petak {position}</span>
             </div>
          </div>
       </div>

       {/* Active Turn Indicator */}
       {isActive && (
         <div className={`absolute -top-5 ${isFlipped ? 'left-6' : 'right-6'} bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] md:text-[11px] font-black px-4 py-1 rounded-full shadow-lg border-2 border-white animate-pulse tracking-widest z-50`}>
           ⭐ GILIRANMU ⭐
         </div>
       )}
    </div>
  )
}

export default PlayerPanel
