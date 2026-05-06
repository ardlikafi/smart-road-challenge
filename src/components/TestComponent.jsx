import React from 'react'

const TestComponent = () => {
  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-4xl font-bold mb-4">🎮 Test Component</div>
        <div className="text-xl mb-2">Smart Road Challenge</div>
        <div className="text-lg">Component renders successfully!</div>
        <div className="mt-4 p-4 bg-blue-600 rounded-lg">
          If you see this, React is working!
        </div>
      </div>
    </div>
  )
}

export default TestComponent
