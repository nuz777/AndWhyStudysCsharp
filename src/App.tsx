import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { Home } from './pages/Home'
import { Panel } from './pages/Panel'
import { AccessModal } from './components/AccessModal'
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta Home: Únicamente el Hero y el Header sobre /saku.png */}
          <Route path="/" element={<Home />} />

          {/* Ruta Panel: Vista completa de apuntes, temas y tarjetas transparentes */}
          <Route path="/panel" element={<Panel />} />

          {/* Redirección para cualquier otra ruta */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Modal global de contraseña (ivanDavid2007) */}
        <AccessModal />
      </BrowserRouter>
    </AuthProvider>
  )
}
