import './globals.scss'

import { createTheme, ThemeProvider } from '@mui/material/styles'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { SnackbarProvider } from 'notistack'
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
  const { isAuthed } = useAuth()

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'de'}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <Routes>
            {/* main routes require authentication */}
            <Route path="/" element={<Layout />}>
              <Route
                path=""
                element={
                  <ProtectedRoute>
                    <Navigate to="/timetable" replace={true} />
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
              <Route path="privateCustomers">
                <Route
                  path=""
                  element={
                    <ProtectedRoute>
                      <Pages.PrivateCustomers />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path=":id"
                  element={
                    <ProtectedRoute>
                      <Pages.PrivateCustomerDetailView />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route
                path="schoolCustomers"
                element={
                  <ProtectedRoute>
                    <Pages.SchoolCustomers />
                  </ProtectedRoute>
                }
              />
              <Route path="teachers">
                <Route
                  path=""
                  element={
                    <ProtectedRoute>
                      <Pages.Teachers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":id"
                  element={
                    <ProtectedRoute>
                      <Pages.TeacherDetailView />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route
                path="subjects"
                element={
                  <ProtectedRoute>
                    <Pages.Subjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profil"
                element={
                  <ProtectedRoute>
                    <Pages.TeacherDetailView />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route
              path="login"
              element={
                !isAuthed() ? (
                  <Pages.Login />
                ) : (
                  <Navigate to="/" replace={true} />
                )
              }
            />

            <Route path="reset">
              <Route path="" element={<Navigate to="/" replace={true} />} />
              <Route path=":token" element={<Pages.Reset />} />
            </Route>

            <Route path="*" element={<Pages.NotFound />} />
          </Routes>
        </SnackbarProvider>
      </ThemeProvider>
    </LocalizationProvider>
  )
}

export default App
