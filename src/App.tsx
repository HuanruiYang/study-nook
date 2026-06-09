import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Home from './pages/Home'
import Shelf from './pages/Shelf'
import BookDetail from './pages/BookDetail'
import Sparks from './pages/Sparks'
import YearMap from './pages/YearMap'
import ImportKindle from './pages/ImportKindle'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="/shelf" element={<Shelf />} />
            <Route path="/shelf/time" element={<Shelf />} />
            <Route path="/shelf/books" element={<Shelf />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/sparks" element={<Sparks />} />
            <Route path="/year" element={<YearMap />} />
            <Route path="/import/kindle" element={<ImportKindle />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
