import React from 'react'
import WallCalendar from './components/WallCalendar'

function App() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <WallCalendar />
    </main>
  )
}

export default App
