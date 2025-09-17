import { useState } from 'react'
import './App.css'
import ProfileForm from './components/ProfileForm.jsx'
import ResultsList from './components/ResultsList.jsx'

function App() {
  const [recommendations, setRecommendations] = useState([])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="w-full py-4 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold">Your Internship Recommendations</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <ProfileForm onResults={setRecommendations} />
        <ResultsList items={recommendations} />
      </main>
    </div>
  )
}

export default App
