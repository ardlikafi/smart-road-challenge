import React, { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Import assets so Vite bundles them correctly for Vercel
import mapOpeningImg from '../../assets/map_opening.png'
import welcomePageImg from '../../assets/welcome_page.png'
import btnSingleImg from '../../assets/btn_single.png'
import btnMultiImg from '../../assets/btn_multi.png'

const Home = () => {
  const navigate = useNavigate()
  const [showSplash, setShowSplash] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const titleRef = useRef(null)
  const singleButtonRef = useRef(null)
  const multiButtonRef = useRef(null)

  useEffect(() => {
    console.log('Home component mounted')
    
    // Simple timer
    const timer = setTimeout(() => {
      console.log('Timer triggered, switching to welcome')
      setShowSplash(false)
      setShowWelcome(true)
      
      // Start animations when welcome appears
      setTimeout(() => {
        animateWelcomePage()
      }, 100)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const animateWelcomePage = () => {
    // Animate title dengan bounce effect
    if (titleRef.current) {
      titleRef.current.style.animation = 'titleBounce 1.5s ease-out'
    }
    
    // Animate buttons dengan delay
    const buttons = [singleButtonRef.current, multiButtonRef.current]
    buttons.forEach((button, index) => {
      if (button) {
        setTimeout(() => {
          button.style.animation = 'buttonSlideIn 0.8s ease-out'
        }, index * 300)
      }
    })
  }

  console.log('Rendering state:', { showSplash, showWelcome })

  // Splash Screen dengan map_opening.png
  if (showSplash) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
           style={{ backgroundImage: `url(${mapOpeningImg})` }}>
        
        {/* Loading content */}
        <div className="relative z-10 text-center bg-black/40 backdrop-blur-sm rounded-2xl p-12">
          <div className="w-20 h-20 mx-auto mb-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <h1 className="text-5xl text-white font-bold mb-4">Smart Road Challenge</h1>
          <p className="text-white text-xl animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  // Welcome Page dengan welcome_page.png tanpa bungkus
  return (
    <>
      <div className="w-full h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
           style={{ backgroundImage: `url(${welcomePageImg})` }}>
        
        {/* Dark overlay untuk kontras */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content - Tanpa bungkus, langsung di tengah */}
        <div className="relative z-10 text-center">
          {/* Title Section */}
          <div ref={titleRef} className="mb-10">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
              Smart Road Challenge
            </h1>
            <p className="text-2xl md:text-3xl text-white drop-shadow-lg">
              Game Edukasi Lalu Lintas untuk Anak
            </p>
          </div>
          
          {/* Mode Selection */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 drop-shadow-lg animate-pulse">
              Pilih Mode Game
            </h2>
          </div>
          
          {/* Buttons Container - Langsung button tanpa bungkus */}
          <div className="flex flex-col md:flex-row gap-16 items-center justify-center mb-12">
            {/* Single Player Button */}
            <button
              ref={singleButtonRef}
              onClick={() => {
                localStorage.setItem('gameMode', 'single')
                navigate('/setup')
              }}
              className="group relative transform transition-all duration-500 hover:scale-110 hover:-translate-y-2"
            >
              <img 
                src={btnSingleImg} 
                alt="Main Sendiri"
                className="w-72 h-36 md:w-96 md:h-48 object-contain filter drop-shadow-2xl transition-all duration-300 group-hover:drop-shadow-3xl"
              />
            </button>
            
            {/* Multi Player Button */}
            <button
              ref={multiButtonRef}
              onClick={() => {
                localStorage.setItem('gameMode', 'multi')
                navigate('/setup')
              }}
              className="group relative transform transition-all duration-500 hover:scale-110 hover:-translate-y-2"
            >
              <img 
                src={btnMultiImg} 
                alt="Main Berdua"
                className="w-72 h-36 md:w-96 md:h-48 object-contain filter drop-shadow-2xl transition-all duration-300 group-hover:drop-shadow-3xl"
              />
            </button>
          </div>
          
          {/* Footer Info */}
          <div className="text-white/80 text-sm animate-pulse">
            <p className="mb-1">Skripsi PGSD - SDN 3 Sedayulawas</p>
            <p className="text-xs">Kelas 2 - Pendidikan Guru Sekolah Dasar</p>
          </div>
        </div>
      </div>
      
      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes titleBounce {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(0deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        @keyframes buttonSlideIn {
          0% {
            transform: translateY(50px) scale(0);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}

export default Home
