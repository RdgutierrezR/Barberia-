import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Barberia from './pages/Barberia'
import TurnoConfirmado from './pages/TurnoConfirmado'
import BarberoDashboard from './pages/BarberoDashboard'
import Login from './pages/Login'
import AdminPanel from './pages/AdminPanel'
import OwnerDashboard from './pages/OwnerDashboard'
import './App.css'
import './nuevo.css'

function RedirectBySession() {
  const token = localStorage.getItem('barbero_token')
  const rol = localStorage.getItem('barbero_rol')
  const barberiaId = localStorage.getItem('barberia_id')
  const barberoId = localStorage.getItem('barbero_id')

  if (token && barberiaId) {
    if (rol === 'admin') return <Navigate to="/admin" replace />
    if (rol === 'owner') return <Navigate to={`/barberia/${barberiaId}/dashboard`} replace />
    if (rol === 'barbero') return <Navigate to={`/barbero/${barberiaId}/${barberoId}`} replace />
  }

  return <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirectBySession />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/barberia/:id" element={<Barberia />} />
        <Route path="/barberia/:id/dashboard" element={<OwnerDashboard />} />
        <Route path="/turno/:codigo" element={<TurnoConfirmado />} />
        <Route path="/barbero/:id_barberia/:id_barbero" element={<BarberoDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
