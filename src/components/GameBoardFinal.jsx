import { useEffect, useRef, useCallback, useState } from 'react'
import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

// Import static assets
import bgEnvironmentImg from '../../assets/bg_environtment.webp'

// Hanya 6 map yang dipakai (dikurangi dari 10 supaya game tidak terlalu panjang)
import map1Img from '../../assets/maps/map_1.webp'
import map2Img from '../../assets/maps/map_2.webp'
import map3Img from '../../assets/maps/map_3.webp'
import map4Img from '../../assets/maps/map_4.webp'
import map5Img from '../../assets/maps/map_5.webp'
import map6Img from '../../assets/maps/map_6.webp'
import map7Img from '../../assets/maps/map_7.webp'
import map8Img from '../../assets/maps/map_10.webp'  // Map 10 (sekolah) sebagai finish

import pionBoyImg from '../../assets/pion_boy.webp'
import pionGirlImg from '../../assets/pion_girl.webp'
import ceweAdatImg from '../../assets/tile_ceweadat.webp'
import cowoAdatImg from '../../assets/tile_cowoadat.webp'
import superwomanImg from '../../assets/tile_superwoman.webp'

// Environment & World Assets
import cloud1Img from '../../assets/env_cloud_1.webp'
import cloud2Img from '../../assets/env_cloud_2.webp'
import birdImg from '../../assets/bird_env.webp'
import chickenImg from '../../assets/chicken.webp'
import catImg from '../../assets/cat.webp'

const TOTAL_MAPS = 8

const calculateScale = (yStr) => {
  if (!yStr) return 1;
  const y = parseFloat(yStr);
  let scale = 0.5 + ((y - 30) / (95 - 30)) * (1.1 - 0.5);
  return Math.max(0.4, Math.min(1.2, scale));
}

const GameBoardFinal = ({ 
  player1Position, 
  player2Position, 
  gameMode, 
  tileCoordinates,
  player1Pion = 'boy',
  player2Pion = 'girl',
  showDebug = false,
  weatherType = 'normal',
  currentPlayer = 1
}) => {
  const containerRef = useRef(null)
  const mapWrapperRef = useRef(null)
  const player1Ref = useRef(null)
  const player2Ref = useRef(null)
  const transitionOverlayRef = useRef(null)
  const currentMapRef = useRef(0)
  const [lastClick, setLastClick] = useState(null)
  const [recordedPoints, setRecordedPoints] = useState([])
  const [debugMapIndex, setDebugMapIndex] = useState(0)
  
  const mapImages = [map1Img, map2Img, map3Img, map4Img, map5Img, map6Img, map7Img, map8Img]
  const TOTAL_MAPS = mapImages.length;

  const getPionImg = (type) => {
    switch(type) {
      case 'boy': return pionBoyImg;
      case 'girl': return pionGirlImg;
      case 'cowoadat': return cowoAdatImg;
      case 'ceweadat': return ceweAdatImg;
      case 'superwoman': return superwomanImg;
      default: return pionBoyImg;
    }
  };

  const handleMapClick = useCallback((e) => {
    if (!mapWrapperRef.current) return;
    const rect = mapWrapperRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const xPercent = (offsetX / rect.width) * 100;
    const yPercent = (offsetY / rect.height) * 100;
    const localMap = Math.floor(xPercent / (100 / TOTAL_MAPS));
    const localX = (xPercent % (100 / TOTAL_MAPS)) * TOTAL_MAPS;
    const info = { map: localMap + 1, x: parseFloat(localX.toFixed(1)), y: parseFloat(yPercent.toFixed(1)) };
    console.log(`Map ${info.map} | { x: ${info.x}, y: ${info.y} }`);
    if (showDebug) {
      setLastClick(info);
      setRecordedPoints(prev => {
        if (prev.length > 0 && prev[0].map !== info.map) return [info];
        return [...prev.slice(-9), info];
      });
    }
  }, [showDebug]);

  // Sync debug map dengan map saat ini saat masuk debug mode
  useEffect(() => {
    if (showDebug) {
      setDebugMapIndex(currentMapRef.current);
    }
  }, [showDebug]);

  // Navigasi kamera map di mode debug
  useEffect(() => {
    if (!mapWrapperRef.current) return;
    const totalWidth = mapWrapperRef.current.offsetWidth;
    const mapWidth = totalWidth / TOTAL_MAPS;

    if (showDebug) {
      const targetCameraX = debugMapIndex * mapWidth;
      gsap.to(mapWrapperRef.current, {
        x: -targetCameraX,
        duration: 0.5,
        ease: 'power2.out'
      });
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          backgroundPositionX: `${-targetCameraX * 0.12}px`,
          duration: 1.0,
          ease: 'power2.inOut'
        });
      }
    } else {
      // Kembali ke posisi player saat matikan debug mode
      const targetCameraX = currentMapRef.current * mapWidth;
      gsap.to(mapWrapperRef.current, {
        x: -targetCameraX,
        duration: 0.5,
        ease: 'power2.out'
      });
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          backgroundPositionX: `${-targetCameraX * 0.12}px`,
          duration: 1.0,
          ease: 'power2.inOut'
        });
      }
    }
  }, [debugMapIndex, showDebug, TOTAL_MAPS]);

  // State tracking untuk deteksi perubahan posisi
  const prevP1Pos = useRef(player1Position);
  const prevP2Pos = useRef(player2Position);

  // Animasi Player 1
  useEffect(() => {
    if (!mapWrapperRef.current) return;
    const coord = tileCoordinates[player1Position];
    if (coord && player1Ref.current) {
      const scale = calculateScale(coord.y);
      
      // Jika pertama kali, cukup set tanpa animasi lompat
      if (!player1Ref.current.style.left) {
        gsap.set(player1Ref.current, { left: coord.x, top: coord.y, scale: scale, transformOrigin: 'bottom center' });
      } else if (prevP1Pos.current !== player1Position) {
        // Jika posisi berubah, jalan + lompat
        gsap.to(player1Ref.current, { left: coord.x, top: coord.y, scale: scale, duration: 0.55, ease: 'power1.inOut' });
        const pionImg = player1Ref.current.querySelector('img');
        if (pionImg) {
          gsap.fromTo(pionImg, { y: 0 }, { y: -25, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.out' });
        }
      }
      prevP1Pos.current = player1Position;
    }
  }, [player1Position, tileCoordinates]);

  // Animasi Player 2
  useEffect(() => {
    if (gameMode !== 'multi' || !mapWrapperRef.current) return;
    const coord = tileCoordinates[player2Position];
    if (coord && player2Ref.current) {
      const scale = calculateScale(coord.y);
      
      if (!player2Ref.current.style.left) {
        gsap.set(player2Ref.current, { left: coord.x, top: coord.y, scale: scale, transformOrigin: 'bottom center' });
      } else if (prevP2Pos.current !== player2Position) {
        gsap.to(player2Ref.current, { left: coord.x, top: coord.y, scale: scale, duration: 0.55, ease: 'power1.inOut' });
        const pionImg = player2Ref.current.querySelector('img');
        if (pionImg) {
          gsap.fromTo(pionImg, { y: 0 }, { y: -25, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.out' });
        }
      }
      prevP2Pos.current = player2Position;
    }
  }, [player2Position, tileCoordinates, gameMode]);

  // Sistem Kamera Cerdas (Mengikuti pemain yang aktif)
  useEffect(() => {
    if (!mapWrapperRef.current || showDebug || !tileCoordinates.length) return;
    
    const activePosition = currentPlayer === 1 ? player1Position : player2Position;
    const activeCoord = tileCoordinates[activePosition];
    if (!activeCoord) return;

    const totalWidth = mapWrapperRef.current.offsetWidth;
    let pxX = activeCoord.x;
    if (typeof pxX === 'string' && pxX.includes('%')) {
      pxX = (parseFloat(pxX) / 100) * totalWidth;
    }

    const viewportWidth = window.innerWidth;
    const mapWidth = totalWidth / TOTAL_MAPS;
    const newMapIndex = Math.min(TOTAL_MAPS - 1, Math.max(0, Math.floor(pxX / mapWidth)));

    // Clamp kamera agar tidak bocor memperlihatkan sisi map
    const minCameraX = newMapIndex * mapWidth;
    const maxCameraX = Math.max(minCameraX, (newMapIndex + 1) * mapWidth - viewportWidth);

    let targetCameraX = pxX - (viewportWidth / 2);
    targetCameraX = Math.max(minCameraX, Math.min(maxCameraX, targetCameraX));

    if (newMapIndex !== currentMapRef.current) {
      currentMapRef.current = newMapIndex;
      // Transisi Halus Pindah Zona Map
      gsap.to(transitionOverlayRef.current, {
        opacity: 1,
        duration: 0.25,
        onComplete: () => {
          gsap.set(mapWrapperRef.current, { x: -targetCameraX });
          gsap.to(transitionOverlayRef.current, { opacity: 0, duration: 0.4, delay: 0.1 });
        }
      });
    } else {
      // Panning kamera halus saat pemain bergerak
      gsap.to(mapWrapperRef.current, {
        x: -targetCameraX,
        duration: 0.8,
        ease: 'power2.out'
      });
    }

    // Parallax background
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        backgroundPositionX: `${-targetCameraX * 0.12}px`,
        duration: 1.0,
        ease: 'power2.inOut'
      });
    }
  }, [currentPlayer, player1Position, player2Position, tileCoordinates, showDebug, TOTAL_MAPS]);

  // Animasi idle & environment
  useEffect(() => {
    // Pion idle breathing
    const p1img = player1Ref.current?.querySelector('img');
    const p2img = player2Ref.current?.querySelector('img');
    if (p1img) {
      gsap.to(p1img, { scaleY: 0.96, scaleX: 1.04, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }
    if (p2img) {
      gsap.to(p2img, { scaleY: 0.96, scaleX: 1.04, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.3 });
    }

    // Awan bergerak horizontal (fixed ke layar, bukan map)
    gsap.fromTo('.env-cloud-1',
      { x: -200 },
      { x: '110vw', duration: 35, repeat: -1, ease: 'linear' }
    );
    gsap.fromTo('.env-cloud-2',
      { x: '110vw' },
      { x: -300, duration: 50, repeat: -1, ease: 'linear' }
    );

    // Burung terbang
    gsap.fromTo('.env-bird',
      { x: -80, y: 0 },
      { x: '110vw', y: -30, duration: 20, repeat: -1, ease: 'sine.inOut' }
    );

    // Hewan dekoratif di trotoar — gerak naik-turun kecil
    gsap.to('.env-sidewalk-animal', {
      y: -6,
      duration: 0.8,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      stagger: 0.4
    });
  }, []);

  // Konfigurasi hewan dekoratif per map (diletakkan di trotoar/pinggir jalan, bukan aspal)
  // Posisi: top = sekitar 68-78% (area trotoar di bawah jalan), left = pinggir kiri/kanan
  const sidewalkAnimals = [
    // map index 0 (Map 1): ayam di trotoar kiri
    { mapIdx: 0, animal: 'chicken', top: '76%', left: '15%' },
    // map index 1 (Map 2): kucing di trotoar kiri
    { mapIdx: 1, animal: 'cat',     top: '72%', left: '22%' },
    // map index 2 (Map 3): ayam di trotoar kiri
    { mapIdx: 2, animal: 'chicken', top: '72%', left: '12%' },
    // map index 3 (Map 4): kucing di trotoar kiri
    { mapIdx: 3, animal: 'cat',     top: '72%', left: '18%' },
    // map index 4 (Map 5): ayam di trotoar kiri
    { mapIdx: 4, animal: 'chicken', top: '71%', left: '14%' },
    // map index 5 (Map 6/finish): tidak ada hewan, biarkan bersih
  ];

  return (
    <div 
      ref={containerRef}
      className="game-board-container relative w-full h-screen overflow-hidden bg-[#87CEEB]"
      style={{
        backgroundImage: `url(${bgEnvironmentImg})`,
        backgroundSize: 'cover',
        backgroundPosition: '0px center',
        backgroundRepeat: 'repeat-x'
      }}
    >
      {/* Map Wrapper: 8 map sejajar secara horizontal dengan lebar minimum 100vw agar tidak bocor */}
      <div 
        ref={mapWrapperRef}
        className="absolute top-0 left-0 h-screen flex flex-row cursor-crosshair"
        style={{ width: `calc(${TOTAL_MAPS} * max(100vw, 100vh * 16 / 9))` }}
        onClick={handleMapClick}
      >
        {mapImages.map((mapImg, index) => (
          <div key={index} className="relative h-screen flex-shrink-0" style={{ width: 'max(100vw, calc(100vh * 16 / 9))' }}>
            <img 
              src={mapImg} 
              alt={`Map ${index + 1}`} 
              className="w-full h-full object-cover pointer-events-none select-none" 
            />

            {/* Hewan dekoratif — diletakkan di area trotoar (bukan di tengah jalan) */}
            {sidewalkAnimals
              .filter(a => a.mapIdx === index)
              .map((a, i) => (
                <img
                  key={i}
                  src={a.animal === 'chicken' ? chickenImg : catImg}
                  alt={a.animal}
                  className="absolute env-sidewalk-animal z-10 drop-shadow-md select-none pointer-events-none"
                  style={{
                    top: a.top,
                    left: a.left,
                    width: '48px',
                    height: 'auto',
                    // Pastikan tidak menutupi jalur aspal utama
                  }}
                />
              ))
            }
          {/* SVG Debug Overlay — titik + garis waypoint per map */}
            {showDebug && (() => {
              const tilesForMap = tileCoordinates.slice(index * 10, (index + 1) * 10);
              const pts = tilesForMap.map(tile => ({
                x: parseFloat(tile.x) * TOTAL_MAPS - index * 100,
                y: parseFloat(tile.y)
              }));
              return (
                <svg className="absolute inset-0 w-full h-full z-50 pointer-events-none" style={{overflow:'visible'}}>
                  {pts.map((pt, i) => {
                    if (i === 0) return null;
                    const prev = pts[i - 1];
                    return <line key={`l${i}`} x1={`${prev.x}%`} y1={`${prev.y}%`} x2={`${pt.x}%`} y2={`${pt.y}%`} stroke="#ff6a00" strokeWidth="3" strokeDasharray="8,4" strokeOpacity="0.95" />;
                  })}
                  {pts.map((pt, i) => (
                    <g key={`d${i}`}>
                      <circle cx={`${pt.x}%`} cy={`${pt.y}%`} r="14" fill="rgba(255,60,0,0.88)" stroke="white" strokeWidth="2.5" />
                      <text x={`${pt.x}%`} y={`${pt.y}%`} dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{i + 1}</text>
                    </g>
                  ))}
                </svg>
              );
            })()}
          </div>
        ))}

        {/* Pion Player 1
            transform: translate(-50%, -100%) → titik anchor di kaki pion,
            sehingga kaki tepat di waypoint (tengah jalur aspal) */}
        <div
          ref={player1Ref}
          className="absolute z-40"
          style={{ 
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            willChange: 'left, top'
          }}
        >
          <img 
            src={getPionImg(player1Pion)}
            alt="Player 1"
            className="w-28 h-28 md:w-36 md:h-36"
            style={{ filter: 'drop-shadow(0 8px 6px rgba(0,0,0,0.5))' }}
          />
        </div>

        {/* Pion Player 2 */}
        {gameMode === 'multi' && (
          <div
            ref={player2Ref}
            className="absolute z-39"
            style={{ 
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              willChange: 'left, top'
            }}
          >
            <img 
              src={getPionImg(player2Pion)}
              alt="Player 2"
              className="w-28 h-28 md:w-36 md:h-36"
              style={{ filter: 'drop-shadow(0 8px 6px rgba(0,0,0,0.5))' }}
            />
          </div>
        )}
      </div>

      {/* WEATHER SYSTEM OVERLAYS */}
      {weatherType === 'rain' && (
        <div className="absolute inset-0 z-[35] pointer-events-none bg-slate-900/40 transition-colors duration-1000 overflow-hidden flex justify-center">
           {Array.from({ length: 80 }).map((_, i) => (
             <div 
               key={i} 
               className="absolute bg-blue-100/60 w-[2px] h-[35px] rounded-full"
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `-${Math.random() * 20 + 10}vh`,
                 animation: `rain-fall ${0.3 + Math.random() * 0.4}s linear infinite`,
                 animationDelay: `${Math.random()}s`
               }}
             />
           ))}
        </div>
      )}

      {weatherType === 'clear' && (
        <div className="absolute inset-0 z-[35] pointer-events-none mix-blend-overlay bg-gradient-to-tr from-transparent via-yellow-200/30 to-orange-400/40 transition-colors duration-1000" />
      )}

      {/* Awan & Burung — fixed ke layar biar tidak ikut scroll map */}
      <div className="absolute top-8 left-0 opacity-85 z-20 env-cloud-1 pointer-events-none">
        <img src={cloud1Img} alt="Cloud" className={`w-56 md:w-72 drop-shadow-md transition-all duration-1000 ${weatherType === 'rain' ? 'brightness-50 grayscale' : ''}`} />
      </div>
      <div className="absolute top-16 right-0 opacity-75 z-20 env-cloud-2 pointer-events-none">
        <img src={cloud2Img} alt="Cloud" className={`w-64 md:w-80 drop-shadow-md transition-all duration-1000 ${weatherType === 'rain' ? 'brightness-50 grayscale' : ''}`} />
      </div>
      <div className="absolute top-24 left-0 z-20 env-bird pointer-events-none">
        <img src={birdImg} alt="Bird" className="w-14 md:w-20 drop-shadow-sm" />
      </div>

      {/* Fade Transition Overlay (dipakai saat pindah map antar zona) */}
      <div 
        ref={transitionOverlayRef} 
        className="absolute inset-0 bg-white z-[60] pointer-events-none opacity-0"
      />

      {/* Panel Debug Floating */}
      {showDebug && (
        <div className="fixed left-4 bottom-4 z-[90] w-72 bg-gray-950/95 backdrop-blur text-xs font-mono rounded-2xl border border-orange-500 shadow-2xl overflow-hidden">
          <div className="bg-orange-500/20 px-4 py-2.5 border-b border-orange-500/30">
            <p className="text-orange-400 font-bold text-sm">🔧 Debug Mode — Editor Waypoint</p>
            <p className="text-gray-400 text-[10px] mt-0.5">Klik pada jalan → koordinat tampil di sini</p>
            
            {/* Navigasi Pindah Map */}
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-orange-500/20">
               <button 
                  onClick={() => setDebugMapIndex(prev => Math.max(0, prev - 1))}
                  disabled={debugMapIndex === 0}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-sans font-bold rounded-lg text-xs disabled:opacity-30 transition-colors"
               >
                 ◀ Prev
               </button>
               <span className="text-orange-300 font-bold bg-black/40 px-3 py-1 rounded-full">Map {debugMapIndex + 1}</span>
               <button 
                  onClick={() => setDebugMapIndex(prev => Math.min(TOTAL_MAPS - 1, prev + 1))}
                  disabled={debugMapIndex === TOTAL_MAPS - 1}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-sans font-bold rounded-lg text-xs disabled:opacity-30 transition-colors"
               >
                 Next ▶
               </button>
            </div>
          </div>
          {lastClick ? (
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-orange-300 font-semibold mb-1.5">📍 Klik Terakhir — Map {lastClick.map}</p>
              <div className="bg-gray-900 rounded-lg px-3 py-2 text-green-400 font-mono">
                {'{ x: '}{lastClick.x}{', y: '}{lastClick.y}{' }'}
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-[11px] border-b border-gray-800">Belum ada klik...</div>
          )}
          {recordedPoints.length > 0 && (
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-orange-300 font-semibold">📝 Map {recordedPoints[0]?.map} — {recordedPoints.length}/10 titik</p>
                <button onClick={() => setRecordedPoints([])} className="text-red-400 text-[10px] hover:text-red-300">Reset</button>
              </div>
              <div className="bg-gray-900 rounded-xl p-2.5 text-green-400 text-[10px] space-y-0.5 max-h-44 overflow-y-auto">
                {recordedPoints.map((p, i) => (
                  <p key={i} className="leading-relaxed">{`{x: ${p.x}, y: ${p.y}},`}</p>
                ))}
              </div>
              <p className="text-gray-500 text-[9px] mt-2">Copy poin di atas ke array mapPaths di Game.jsx</p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default GameBoardFinal
