import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'

// Páginas
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Map from './pages/Map'
import MyComplaints from './pages/MyComplaints'
import CreateComplaint from './pages/CreateComplaint'
import ManagerDashboard from './pages/ManagerDashboard'

import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas protegidas */}
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <Home />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/map" element={
            <PrivateRoute>
              <Layout>
                <Map />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/my-complaints" element={
            <PrivateRoute>
              <Layout>
                <MyComplaints />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/create-complaint" element={
            <PrivateRoute>
              <Layout>
                <CreateComplaint />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/dashboard" element={
            <PrivateRoute requireManager>
              <Layout>
                <ManagerDashboard />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  )
}

export default App

