import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdopterHomePage from './pages/AdopterHomePage'
import ShelterHomePage from './pages/ShelterHomePage'
import AdminHomePage from './pages/AdminHomePage'
import NotFoundPage from './pages/NotFoundPage'
import { AuthProvider } from './context/AuthProvider'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        <Route path="/adoptante/*" element={<AdopterHomePage />} />
        <Route path="/refugio/*" element={<ShelterHomePage />} />
        <Route path="/admin/*" element={<AdminHomePage />} />

        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
