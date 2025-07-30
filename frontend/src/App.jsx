import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import LoginPage from './pages/Login'
import SignUpPage from './pages/Signup'
import Home from './pages/Home'
import AlbumPage from './pages/Album'
import { BrowserRouter,Route,Routes, Navigate } from "react-router-dom"
import ProtectedRoute from './components/ProtectedRoute'
import PlaylistPage from './pages/Playlist'
import BoothboxdAdmin from './pages/Admin'
import AdminRoute from './components/AdminRoute'
import UserProfile from './pages/proflie'

function Logout(){
  localStorage.clear()
  return (
  <Navigate to="/login"/>)
}

function RegisterAndLogout(){
  localStorage.clear()
  return (
     <SignUpPage/>
  )
}

function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/user" element={
          <ProtectedRoute>
          <UserProfile/>
          </ProtectedRoute>}/>
        <Route path="/home" element={
          <ProtectedRoute>
          <Home/>
          </ProtectedRoute>}/>
        <Route path="/register" element={<SignUpPage/>} />
        <Route path ="/" element={<LoginPage/>}/>
        <Route path="/test/:albumName" element={
          <ProtectedRoute>
          <AlbumPage/>
          </ProtectedRoute>} />
         <Route path="/playlists/:playlist_name" element={
          <ProtectedRoute>
          <PlaylistPage/>
          </ProtectedRoute>} />
          <Route path="/admin" element={
          <AdminRoute>
          <BoothboxdAdmin/>
          </AdminRoute>} />
      </Routes>
    </BrowserRouter>
  )
}


export default App
