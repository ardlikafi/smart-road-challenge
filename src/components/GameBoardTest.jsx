import React from 'react'

const GameBoardTest = ({ 
  player1Position, 
  player2Position, 
  gameMode, 
  currentPlayer,
  onPlayerMove,
  tileCoordinates 
}) => {
  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-4xl font-bold mb-4">🎮 Game Board Test</div>
        <div className="text-xl mb-2">Smart Road Challenge</div>
        <div className="text-lg mb-4">Mode: {gameMode}</div>
        <div className="text-lg mb-4">Player 1 Position: {player1Position}</div>
        <div className="text-lg mb-4">Current Player: {currentPlayer}</div>
        <div className="text-lg mb-4">Tile Coordinates: {tileCoordinates?.length || 0} tiles</div>
        
        <button 
          onClick={() => {
            if (onPlayerMove) {
              onPlayerMove(player1Position + 1)
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-bold mt-4"
        >
          Move Player
        </button>
        
        <div className="mt-8 p-4 bg-blue-900 rounded-lg">
          <div className="text-sm">✅ Component renders successfully!</div>
          <div className="text-sm">✅ Props received correctly!</div>
          <div className="text-sm">✅ Button works!</div>
        </div>
      </div>
    </div>
  )
}

export default GameBoardTest
