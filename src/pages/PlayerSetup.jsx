import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

  useEffect(() => {
    console.log('PlayerSetup: Component mounted')
    const mode = localStorage.getItem('gameMode')
    console.log('PlayerSetup: Game mode from localStorage:', mode)
    setGameMode(mode || 'single')
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('PlayerSetup: Form submitted')
    
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
    
    console.log('PlayerSetup: Navigating to game')
    navigate('/game')
  }

  const handleBack = () => {
    console.log('PlayerSetup: Back button clicked')
    navigate('/')
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: `url(${mapOpeningImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      fontFamily: "'Nunito', sans-serif"
    }}>
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropBlur: '5px'
      }} />
      
      {/* Form Container */}
      <div style={{
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '30px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
        maxWidth: '500px',
        width: '100%',
        margin: '0 20px',
        border: '4px solid white'
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '900',
          textAlign: 'center',
          marginBottom: '30px',
          color: '#1e40af',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {gameMode === 'single' ? '🚀 Single Player' : '👥 Multi Player'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Player 1 Section */}
          <div style={{ marginBottom: '25px', backgroundColor: '#eff6ff', padding: '20px', borderRadius: '20px', border: '2px solid #bfdbfe' }}>
            <label style={{
              display: 'block',
              fontSize: '18px',
              fontWeight: '800',
              marginBottom: '15px',
              color: '#1e3a8a'
            }}>
              👤 Nama Player 1
            </label>
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Masukkan nama"
              style={{
                width: '100%',
                padding: '12px 20px',
                border: '3px solid #dbeafe',
                borderRadius: '15px',
                fontSize: '18px',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '15px'
              }}
              maxLength={15}
              required
            />
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { id: 'boy', img: pionBoyImg, label: 'BOY' },
                { id: 'girl', img: pionGirlImg, label: 'GIRL' },
                { id: 'cowoadat', img: cowoAdatImg, label: 'COWO ADAT' },
                { id: 'ceweadat', img: ceweAdatImg, label: 'CEWE ADAT' },
                { id: 'superwoman', img: superwomanImg, label: 'SUPERHERO' }
              ].map(pion => (
                <div 
                  key={pion.id}
                  onClick={() => setPlayer1Pion(pion.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '10px',
                    borderRadius: '15px',
                    border: player1Pion === pion.id ? '4px solid #3b82f6' : '4px solid transparent',
                    backgroundColor: player1Pion === pion.id ? 'white' : 'transparent',
                    transition: 'all 0.3s'
                  }}
                >
                  <img src={pion.img} alt={pion.label} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                  <p style={{ textAlign: 'center', margin: '5px 0 0', fontWeight: 'bold', fontSize: '10px' }}>{pion.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Player 2 Section */}
          {gameMode === 'multi' && (
            <div style={{ marginBottom: '25px', backgroundColor: '#fdf2f8', padding: '20px', borderRadius: '20px', border: '2px solid #fbcfe8' }}>
              <label style={{
                display: 'block',
                fontSize: '18px',
                fontWeight: '800',
                marginBottom: '15px',
                color: '#831843'
              }}>
                👤 Nama Player 2
              </label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Masukkan nama"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  border: '3px solid #fce7f3',
                  borderRadius: '15px',
                  fontSize: '18px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '15px'
                }}
                maxLength={15}
                required
              />
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { id: 'boy', img: pionBoyImg, label: 'BOY' },
                  { id: 'girl', img: pionGirlImg, label: 'GIRL' },
                  { id: 'cowoadat', img: cowoAdatImg, label: 'COWO ADAT' },
                  { id: 'ceweadat', img: ceweAdatImg, label: 'CEWE ADAT' },
                  { id: 'superwoman', img: superwomanImg, label: 'SUPERHERO' }
                ].map(pion => (
                  <div 
                    key={pion.id}
                    onClick={() => setPlayer2Pion(pion.id)}
                    style={{
                      cursor: 'pointer',
                      padding: '10px',
                      borderRadius: '15px',
                      border: player2Pion === pion.id ? '4px solid #ec4899' : '4px solid transparent',
                      backgroundColor: player2Pion === pion.id ? 'white' : 'transparent',
                      transition: 'all 0.3s'
                    }}
                  >
                    <img src={pion.img} alt={pion.label} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <p style={{ textAlign: 'center', margin: '5px 0 0', fontWeight: 'bold', fontSize: '10px' }}>{pion.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                flex: 1,
                backgroundColor: '#94a3b8',
                color: 'white',
                padding: '15px',
                borderRadius: '15px',
                fontWeight: '900',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 0 #64748b'
              }}
            >
              KEMBALI
            </button>
            <button
              type="submit"
              style={{
                flex: 2,
                backgroundColor: '#10b981',
                color: 'white',
                padding: '15px',
                borderRadius: '15px',
                fontWeight: '900',
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 0 #059669'
              }}
            >
              MULAI GAME! 🎲
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PlayerSetup
