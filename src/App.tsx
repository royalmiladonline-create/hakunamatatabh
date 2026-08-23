import { useState, useEffect, useCallback } from 'react'
import { Website } from './components/Website'
import { POS } from './components/POS'

type AppView = 'website' | 'pos'

export default function App() {
  const [view, setView] = useState<AppView>('website')

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'website' ? (
        <Website onOpenPOS={() => setView('pos')} />
      ) : (
        <POS onBackToWebsite={() => setView('website')} />
      )}
    </div>
  )
}