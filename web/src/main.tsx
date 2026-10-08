import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import './styles/experience.css'
import './styles/hanging-gallery.css'
import './styles/black-wall.css'

const root = document.getElementById('root')!

// Pages cannot supply frame-ancestors here; do not mount interactive UI in a frame.
if (window.self !== window.top) {
  const link = document.createElement('a')
  link.href = window.location.href
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  link.textContent = 'Open The Black Wall in its own tab'
  root.replaceChildren(link)
} else {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
