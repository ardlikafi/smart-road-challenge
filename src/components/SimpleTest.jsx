import React from 'react'

const SimpleTest = () => {
  return (
    <div className="w-full h-screen bg-blue-600 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-6xl font-bold mb-4">🎮</div>
        <div className="text-3xl mb-2">SIMPLE TEST</div>
        <div className="text-xl">If you see this, React is working!</div>
        <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg">
          <div>✅ Component renders</div>
          <div>✅ Styles work</div>
          <div>✅ No errors</div>
        </div>
      </div>
    </div>
  )
}

export default SimpleTest
