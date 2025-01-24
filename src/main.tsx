import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set default theme to light mode
document.documentElement.classList.remove('dark');

createRoot(document.getElementById("root")!).render(<App />);