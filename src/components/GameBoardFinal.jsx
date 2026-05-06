import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

// Import static assets
import bgEnvironmentImg from '../../assets/bg_environtment.webp'

// Static map imports
import map1Img from '../../assets/maps/map_1.webp'
import map2Img from '../../assets/maps/map_2.webp'
import map3Img from '../../assets/maps/map_3.webp'
import map4Img from '../../assets/maps/map_4.webp'
import map5Img from '../../assets/maps/map_5.webp'
import map6Img from '../../assets/maps/map_6.webp'
import map7Img from '../../assets/maps/map_7.webp'
import map8Img from '../../assets/maps/map_8.webp'
import map9Img from '../../assets/maps/map_9.webp'
import map10Img from '../../assets/maps/map_10.webp'

import pionBoyImg from '../../assets/pion_boy.png'
import pionGirlImg from '../../assets/pion_girl.png'

// Environment & World Assets
import cloud1Img from '../../assets/env_cloud_1.png'
import cloud2Img from '../../assets/env_cloud_2.png'
import birdImg from '../../assets/env_bird.png'
import angkotImg from '../../assets/angkot_1.png'
import chickenImg from '../../assets/chicken.png'
import catImg from '../../assets/cat.png'

const GameBoardFinal = ({ 
  player1Position, 
  player2Position, 
  gameMode, 
  tileCoordinates 
}) => {
  const containerRef = useRef(null)
  const mapWrapperRef = useRef(null)
  const player1Ref = useRef(null)
  const player2Ref = useRef(null)
  const transitionOverlayRef = useRef(null)
  const currentMapRef = useRef(0)
  
  const mapImages = [
    map1Img, map2Img, map3Img, map4Img, map5Img, 
    map6Img, map7Img, map8Img, map9Img, map10Img
  ]

  // System Waypoint - Mencetak persentase koordinat ke console pada saat klik
  const handleMapClick = useCallback((e) => {
    if (!mapWrapperRef.current) return;
    const rect = mapWrapperRef.current.getBoundingClientRect();
    
    // Hitung koordinat klik relatif terhadap keseluruhan Map Wrapper
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // Ubah menjadi persentase agar responsif di semua ukuran layar (10 map)
    const xPercent = (offsetX / rect.width) * 100;
    const yPercent = (offsetY / rect.height) * 100;
    
    console.log(`Waypoint Terklik: { x: '${xPercent.toFixed(2)}%', y: '${yPercent.toFixed(2)}%' }`);
  }, []);

  // Update Player & Camera Follow
  useEffect(() => {
    if (!mapWrapperRef.current) return;
    
    const coord1 = tileCoordinates[player1Position];
    
    if (coord1 && player1Ref.current) {
      const totalWidth = mapWrapperRef.current.offsetWidth;
      
      // Ambil nilai X dan Y, dukung format persentase maupun piksel absolut (kompatibilitas)
      let pxX1 = coord1.x;
      
      if (typeof pxX1 === 'string' && pxX1.includes('%')) {
        pxX1 = (parseFloat(pxX1) / 100) * totalWidth;
      }
      
      // Cek apakah ini inisialisasi pertama (posisi 0 dan belum punya left)
      if (!player1Ref.current.style.left) {
        gsap.set(player1Ref.current, { left: coord1.x, top: coord1.y });
      } else {
        // Animasi gerak Pion Player 1
        gsap.to(player1Ref.current, {
          left: coord1.x,
          top: coord1.y,
          duration: 0.6,
          ease: "linear"
        });
      }

      // Efek lompat saat gerak
      if (player1Ref.current.querySelector('img')) {
        gsap.fromTo(player1Ref.current.querySelector('img'),
          { y: 0 },
          { y: -30, duration: 0.3, yoyo: true, repeat: 1, ease: "power1.out" }
        );
      }

      // Follow Camera - Pindah (Paging) per 1 Map Penuh dengan Efek Memudar
      const windowWidth = window.innerWidth;
      const mapWidth = totalWidth / 10;
      
      // Tentukan pemain berada di map ke berapa (0 - 9)
      const newMapIndex = Math.min(9, Math.max(0, Math.floor(pxX1 / mapWidth)));
      const targetCameraX = newMapIndex * mapWidth;
      
      // Jika pindah map, berikan efek memudar (Fade Transition)
      if (newMapIndex !== currentMapRef.current) {
        currentMapRef.current = newMapIndex;
        gsap.to(transitionOverlayRef.current, {
           opacity: 1, 
           duration: 0.3,
           onComplete: () => {
             gsap.set(mapWrapperRef.current, { x: -targetCameraX });
             gsap.to(transitionOverlayRef.current, { opacity: 0, duration: 0.5, delay: 0.1 });
           }
        });
      } else {
        // Jika tidak pindah map, pastikan kamera tetap di posisi
        gsap.to(mapWrapperRef.current, {
          x: -targetCameraX,
          duration: 0.5, 
          ease: "power2.out"
        });
      }

      // Efek Parallax Background
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          backgroundPositionX: `${-targetCameraX * 0.15}px`,
          duration: 1.2,
          ease: "power2.inOut"
        });
      }
    }
    
    // Animasi Player 2 jika mode multiplayer
    if (gameMode === 'multi') {
      const coord2 = tileCoordinates[player2Position];
      if (coord2 && player2Ref.current) {
         if (!player2Ref.current.style.left) {
           gsap.set(player2Ref.current, { left: coord2.x, top: coord2.y });
         } else {
           gsap.to(player2Ref.current, {
             left: coord2.x,
             top: coord2.y,
             duration: 0.6,
             ease: "linear"
           });
         }

         // Efek lompat saat gerak Player 2
         if (player2Ref.current.querySelector('img')) {
           gsap.fromTo(player2Ref.current.querySelector('img'),
             { y: 0 },
             { y: -30, duration: 0.3, yoyo: true, repeat: 1, ease: "power1.out" }
           );
         }
      }
    }
  }, [player1Position, player2Position, tileCoordinates, gameMode]);

  // Idle breathing animation
  useEffect(() => {
    if (player1Ref.current && player1Ref.current.querySelector('img')) {
      gsap.to(player1Ref.current.querySelector('img'), {
        scaleY: 0.95,
        scaleX: 1.05,
        duration: 1,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }
    if (player2Ref.current && player2Ref.current.querySelector('img')) {
      gsap.to(player2Ref.current.querySelector('img'), {
        scaleY: 0.95,
        scaleX: 1.05,
        duration: 1,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 0.2
      });
    }

    // Environment Animations
    // Clouds
    gsap.to('.env-cloud-1', {
      x: "100vw",
      duration: 30,
      repeat: -1,
      ease: "linear",
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % window.innerWidth)
      }
    });
    
    gsap.to('.env-cloud-2', {
      x: "-100vw",
      duration: 45,
      repeat: -1,
      ease: "linear",
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % window.innerWidth)
      }
    });

    // Birds
    gsap.to('.env-bird', {
      y: "-=20",
      x: "100vw",
      duration: 15,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Animals breathing / small movement
    gsap.to('.env-animal', {
      y: -5,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      stagger: 0.3
    });

  }, []);

  return (
    <div 
      ref={containerRef}
      className="game-board-container relative w-full h-screen overflow-hidden bg-[#87CEEB]"
      style={{
        backgroundImage: `url(${bgEnvironmentImg})`,
        backgroundSize: 'cover',
        backgroundPosition: '0px center',
        backgroundRepeat: 'repeat-x' // Penting untuk parallax panjang
      }}
    >
      {/* Map Wrapper - Flex Row 10 Map Side-Scrolling */}
      <div 
        ref={mapWrapperRef}
        className="absolute top-0 left-0 h-screen flex flex-row cursor-crosshair"
        style={{ width: '1000vw' }}
        onClick={handleMapClick}
      >
        {mapImages.map((mapImg, index) => (
          <div key={index} className="relative h-screen flex-shrink-0" style={{ width: '100vw' }}>
            <img 
              src={mapImg} 
              alt={`Map ${index + 1}`} 
              className="w-full h-full object-cover pointer-events-none" 
            />
            {/* Adding scattered animals on maps */}
            {index % 2 === 0 && (
               <img src={chickenImg} alt="Chicken" className="absolute bottom-[30%] left-[40%] w-12 env-animal z-20 drop-shadow-md" />
            )}
            {index % 3 === 0 && (
               <img src={catImg} alt="Cat" className="absolute bottom-[25%] left-[70%] w-12 env-animal z-20 drop-shadow-md" />
            )}
          </div>
        ))}

        {/* Pion Player 1 */}
        <div
          ref={player1Ref}
          className="absolute z-40 transition-transform hover:scale-110"
          style={{ 
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        >
          <img 
            src={pionBoyImg}
            alt="Player 1"
            className="w-32 h-32 md:w-40 md:h-40 filter"
            style={{ filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.4))' }}
          />
        </div>

        {/* Pion Player 2 */}
        {gameMode === 'multi' && (
          <div
            ref={player2Ref}
            className="absolute z-40 transition-transform hover:scale-110"
            style={{ 
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          >
            <img 
              src={pionGirlImg}
              alt="Player 2"
              className="w-32 h-32 md:w-40 md:h-40 filter"
              style={{ filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.4))' }}
            />
          </div>
        )}
      </div>

      {/* Ambient Environment Foreground (Fixed to screen) */}
      <div className="absolute top-10 left-[-200px] opacity-80 z-50 env-cloud-1 pointer-events-none">
        <img src={cloud1Img} alt="Cloud" className="w-64 drop-shadow-md" />
      </div>
      <div className="absolute top-20 right-[-300px] opacity-70 z-50 env-cloud-2 pointer-events-none">
        <img src={cloud2Img} alt="Cloud" className="w-80 drop-shadow-md" />
      </div>
      <div className="absolute top-32 left-[-100px] z-50 env-bird pointer-events-none">
        <img src={birdImg} alt="Bird" className="w-16 drop-shadow-md" />
      </div>

      {/* Fade Transition Overlay */}
      <div 
        ref={transitionOverlayRef} 
        className="absolute inset-0 bg-white z-[60] pointer-events-none opacity-0"
      />
    </div>
  )
}

export default GameBoardFinal
