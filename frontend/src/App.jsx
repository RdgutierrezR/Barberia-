import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Barberia from './pages/Barberia'
import TurnoConfirmado from './pages/TurnoConfirmado'
import BarberoDashboard from './pages/BarberoDashboard'
import Login from './pages/Login'
import AdminPanel from './pages/AdminPanel'
import OwnerDashboard from './pages/OwnerDashboard'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
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
