import { useState } from 'react'
import './App.css'
import DrawingCanvas from './components/DrawingCanvas'

function App() {

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center w-max">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text drop-shadow-lg mt-6 bg-gray-200">
         AI Powered Drawing App 
      </h1>
          <DrawingCanvas />
      </div>
    </>
  )
}

export default App
