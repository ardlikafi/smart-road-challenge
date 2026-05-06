import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'

const GameBoard = ({ 
  player1Position, 
  player2Position, 
  gameMode, 
  currentPlayer,
  onPlayerMove,
  tileCoordinates 
}) => {
  const boardRef = useRef(null)
  const cameraRef = useRef(null)
  const player1Ref = useRef(null)
  const player2Ref = useRef(null)

  // Initialize players and center camera
  useEffect(() => {
    if (player1Ref.current && tileCoordinates[0]) {
      gsap.set(player1Ref.current, {
        x: tileCoordinates[0].x,
        y: tileCoordinates[0].y,
        scale: 0.8,
        transform: 'translate(-50%, -50%)'
      })
    }
    
    if (player2Ref.current && gameMode === 'multi' && tileCoordinates[tileCoordinates.length - 1]) {
      gsap.set(player2Ref.current, {
        x: tileCoordinates[tileCoordinates.length - 1].x,
        y: tileCoordinates[tileCoordinates.length - 1].y,
        scale: 0.8,
        transform: 'translate(-50%, -50%)'
      })
    }

    // Center camera on middle of board initially
    if (cameraRef.current && tileCoordinates.length > 0 && boardRef.current) {
      const middleTile = tileCoordinates[Math.floor(tileCoordinates.length / 2)]
      const containerRect = boardRef.current.getBoundingClientRect()
      const mapContainer = cameraRef.current.querySelector('.relative')
      
      if (containerRect && middleTile && mapContainer) {
        // Get map dimensions
        const mapRect = mapContainer.getBoundingClientRect()
        const mapWidth = Math.min(2400, mapRect.width)
        const mapHeight = 600
        
        // Calculate scale factor
        const scaleX = mapWidth / 2400
        const scaleY = mapHeight / 600
        
        // Adjust middle tile position for scale
        const scaledMiddleX = middleTile.x * scaleX
        const scaledMiddleY = middleTile.y * scaleY
        
        const targetX = -(scaledMiddleX - containerRect.width / 2)
        const targetY = -(scaledMiddleY - containerRect.height / 2)
        
        gsap.set(cameraRef.current, {
          x: targetX,
          y: targetY
        })
      }
    }

    // Setup parallax
    setupParallax()
  }, [gameMode, tileCoordinates])

  // Update camera to follow active player
  const updateCamera = useCallback(() => {
    if (!cameraRef.current || !boardRef.current) return
    
    const activePlayer = currentPlayer === 1 ? player1Ref.current : player2Ref.current
    if (!activePlayer) return
    
    const containerRect = boardRef.current.getBoundingClientRect()
    const mapContainer = cameraRef.current.querySelector('.relative')
    
    if (containerRect && mapContainer) {
      // Get current position of player
      const playerX = gsap.getProperty(activePlayer, "x")
      const playerY = gsap.getProperty(activePlayer, "y")
      
      // Get map dimensions
      const mapRect = mapContainer.getBoundingClientRect()
      const mapWidth = Math.min(2400, mapRect.width)
      const mapHeight = 600
      
      // Calculate scale factor
      const scaleX = mapWidth / 2400
      const scaleY = mapHeight / 600
      
      // Adjust player positions for scale
      const scaledPlayerX = playerX * scaleX
      const scaledPlayerY = playerY * scaleY
      
      // Calculate camera target position (center on player)
      const targetX = -(scaledPlayerX - containerRect.width / 2)
      const targetY = -(scaledPlayerY - containerRect.height / 2)
      
      gsap.to(cameraRef.current, {
        x: targetX,
        y: targetY,
        duration: 1,
        ease: "power2.out"
      })
    }
  }, [currentPlayer])

  // Move player animation
  const movePlayerToPosition = useCallback((playerNum, fromPos, toPos) => {
    const playerRef = playerNum === 1 ? player1Ref.current : player2Ref.current
    if (!playerRef || !tileCoordinates[fromPos] || !tileCoordinates[toPos]) return
    
    const fromCoord = tileCoordinates[fromPos]
    const toCoord = tileCoordinates[toPos]
    
    // Create arc animation for movement
    const timeline = gsap.timeline()
    
    // Calculate arc height
    const arcHeight = 60
    
    timeline
      .to(playerRef, {
        x: toCoord.x,
        y: toCoord.y - arcHeight,
        duration: 0.4,
        ease: "power2.out"
      })
      .to(playerRef, {
        y: toCoord.y,
        duration: 0.3,
        ease: "bounce.out",
        onComplete: () => {
          updateCamera()
          if (onPlayerMove) {
            onPlayerMove(playerNum, toPos)
          }
        }
      })
  }, [tileCoordinates, onPlayerMove, updateCamera])

  // Update camera when current player changes
  useEffect(() => {
    updateCamera()
  }, [currentPlayer, updateCamera])

  // Update player positions when they change with smooth jumping animation
  useEffect(() => {
    if (player1Ref.current && tileCoordinates[player1Position]) {
      const targetCoord = tileCoordinates[player1Position]
      
      // Create jumping animation
      const timeline = gsap.timeline()
      timeline
        .to(player1Ref.current, {
          x: targetCoord.x,
          y: targetCoord.y - 40, // Jump height
          duration: 0.6,
          ease: "power2.out"
        })
        .to(player1Ref.current, {
          y: targetCoord.y,
          duration: 0.3,
          ease: "bounce.out"
        })
    }
  }, [player1Position, tileCoordinates])

  useEffect(() => {
    if (player2Ref.current && gameMode === 'multi' && tileCoordinates[player2Position]) {
      const targetCoord = tileCoordinates[player2Position]
      
      // Create jumping animation
      const timeline = gsap.timeline()
      timeline
        .to(player2Ref.current, {
          x: targetCoord.x,
          y: targetCoord.y - 40, // Jump height
          duration: 0.6,
          ease: "power2.out"
        })
        .to(player2Ref.current, {
          y: targetCoord.y,
          duration: 0.3,
          ease: "bounce.out"
        })
    }
  }, [player2Position, gameMode, tileCoordinates])

  // Setup parallax effects
  const setupParallax = () => {
    // Animate clouds
    const clouds = document.querySelectorAll('.cloud')
    clouds.forEach((cloud, index) => {
      gsap.to(cloud, {
        x: '+=200',
        duration: 20 + index * 5,
        repeat: -1,
        ease: "none"
      })
    })

    // Animate birds
    const birds = document.querySelectorAll('.bird')
    birds.forEach((bird, index) => {
      gsap.to(bird, {
        x: '+=300',
        y: '+=20',
        duration: 15 + index * 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })
    })
  }

  // Render tiles
  const renderTiles = () => {
    return tileCoordinates.map((coord, index) => {
      let tileType = "/assets/tile_normal.png"
      
      if ([3, 7, 11, 15].includes(index)) {
        tileType = "/assets/tile_star.png"
      } else if ([5, 10, 14].includes(index)) {
        tileType = "/assets/tile_light.png"
      }
      
      return (
        <div
          key={index}
          className="absolute"
          style={{
            left: `${coord.x}px`,
            top: `${coord.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <img 
            src={tileType}
            alt={`Tile ${index}`}
            className="w-12 h-12 md:w-16 md:h-16"
          />
        </div>
      )
    })
  }

  return (
    <div 
      ref={boardRef}
      className="relative w-full h-full overflow-hidden bg-gray-100"
      style={{ perspective: '1000px' }}
    >
      <div ref={cameraRef} className="relative w-full h-full">
        {/* Main Map Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="/assets/map_main.png" 
            alt="Game Board"
            className="w-full h-full object-contain"
            style={{ 
              maxWidth: '2400px',
              maxHeight: '600px',
              aspectRatio: '4/1'
            }}
          />
        </div>
        
        {/* Tiles Layer - positioned relative to map */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="relative"
            style={{ 
              width: '100%',
              maxWidth: '2400px',
              height: '600px',
              aspectRatio: '4/1'
            }}
          >
            {renderTiles()}
          </div>
        </div>
        
        {/* Parallax Environment - positioned relative to map */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="relative"
            style={{ 
              width: '100%',
              maxWidth: '2400px',
              height: '600px',
              aspectRatio: '4/1'
            }}
          >
            <img 
              src="/assets/env_cloud_1.png" 
              alt="Cloud 1"
              className="cloud absolute opacity-70"
              style={{ 
                left: '200px', 
                top: '50px',
                width: '120px'
              }}
            />
            <img 
              src="/assets/env_cloud_2.png" 
              alt="Cloud 2"
              className="cloud absolute opacity-60"
              style={{ 
                left: '500px', 
                top: '80px',
                width: '100px'
              }}
            />
            
            <img 
              src="/assets/env_bird.png" 
              alt="Bird"
              className="bird absolute opacity-80"
              style={{ 
                left: '800px', 
                top: '120px',
                width: '30px'
              }}
            />
          </div>
        </div>
        
        {/* Start and Finish Markers - positioned relative to map */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="relative"
            style={{ 
              width: '100%',
              maxWidth: '2400px',
              height: '600px',
              aspectRatio: '4/1'
            }}
          >
            <div 
              className="absolute"
              style={{ 
                left: `${tileCoordinates[0]?.x}px`, 
                top: `${tileCoordinates[0]?.y - 40}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <img 
                src="/assets/house_start.png" 
                alt="Start" 
                className="w-16 h-16 md:w-20 md:h-20"
              />
            </div>
            
            <div 
              className="absolute"
              style={{ 
                left: `${tileCoordinates[tileCoordinates.length - 1]?.x}px`, 
                top: `${tileCoordinates[tileCoordinates.length - 1]?.y - 40}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <img 
                src="/assets/school_finish.png" 
                alt="Finish" 
                className="w-16 h-16 md:w-20 md:h-20"
              />
            </div>
          </div>
        </div>
        
        {/* Players - positioned relative to map */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="relative"
            style={{ 
              width: '100%',
              maxWidth: '2400px',
              height: '600px',
              aspectRatio: '4/1'
            }}
          >
            <img 
              ref={player1Ref}
              src="/assets/pion_boy.png" 
              alt="Player 1"
              className="absolute z-20"
              style={{ 
                width: '50px', 
                height: '50px',
                transform: 'translate(-50%, -50%)'
              }}
            />
            
            {gameMode === 'multi' && (
              <img 
                ref={player2Ref}
                src="/assets/pion_girl.png" 
                alt="Player 2"
                className="absolute z-20"
                style={{ 
                  width: '50px', 
                  height: '50px',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameBoard
