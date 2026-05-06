import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const PlayerSetup = () => {
  const navigate = useNavigate()
  const [gameMode, setGameMode] = useState('single')
  const [player1Name, setPlayer1Name] = useState('')
  const [player2Name, setPlayer2Name] = useState('')

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
    if (gameMode === 'multi') {
      localStorage.setItem('player2Name', player2Name.trim())
    }
    
    console.log('PlayerSetup: Navigating to game')
    navigate('/game')
  }

  const handleBack = () => {
    console.log('PlayerSetup: Back button clicked')
    navigate('/')
  }

  console.log('PlayerSetup: Rendering')

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url("/assets/map_opening.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative'
    }}>
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }} />
      
      {/* Form Container */}
      <div style={{
        position: 'relative',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
        maxWidth: '450px',
        width: '100%',
        margin: '0 20px'
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '30px',
          color: '#1f2937'
        }}>
          {gameMode === 'single' ? 'Single Player' : 'Multi Player'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#374151'
            }}>
              👦 Nama Player 1
            </label>
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Masukkan nama player 1"
              style={{
                width: '100%',
                padding: '15px 20px',
                border: '3px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '18px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              maxLength={20}
              required
            />
          </div>
          
          {gameMode === 'multi' && (
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '10px',
                color: '#374151'
              }}>
                👧 Nama Player 2
              </label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Masukkan nama player 2"
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  border: '3px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '18px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                maxLength={20}
                required
              />
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                flex: 1,
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '15px 25px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              ← Kembali
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                backgroundColor: '#10b981',
                color: 'white',
                padding: '15px 25px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              Mulai Game →
            </button>
          </div>
        </form>
        
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f0f9ff',
          borderRadius: '12px',
          border: '2px solid #0ea5e9'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#0c4a6e',
            textAlign: 'center',
            margin: 0,
            lineHeight: '1.5'
          }}>
            🎲 Kocok dadu untuk bergerak<br/>
            📚 Jawab pertanyaan lalu lintas<br/>
            🏁 Capai sekolah untuk menang!
          </p>
        </div>
      </div>
    </div>
  )
}

export default PlayerSetup
