import './globals.scss'

import { createTheme, ThemeProvider } from '@mui/material/styles'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { useAuth } from './components/AuthProvider'
import Layout from './components/Layout'
import Pages from './pages/_pages'

export type NavigateState = { from: Location }

const ProtectedRoute: React.FC = ({ children }) => {
  const { isAuthed } = useAuth()
  const location = useLocation()

  if (!isAuthed()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

const theme = createTheme()

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        {/* main routes require authentication */}
        <Route path="/" element={<Layout />}>
          <Route
            path=""
            element={
              <ProtectedRoute>
                <Pages.Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="timetable"
            element={
              <ProtectedRoute>
                <Pages.Timetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="customers"
            element={
              <ProtectedRoute>
                <Pages.Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="teachers"
            element={
              <ProtectedRoute>
                <Pages.Teachers />
              </ProtectedRoute>
            }
          />
          <Route
            path="subjects"
            element={
              <ProtectedRoute>
                <Pages.Subjects />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/login" element={<Pages.Login />} />

        <Route path="*" element={<Pages.NotFound />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
