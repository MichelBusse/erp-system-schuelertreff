import './globals.scss'

import { CssBaseline } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { SnackbarProvider } from 'notistack'
import { useEffect } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from './components/AuthProvider'
import Layout from './components/Layout'
import Pages from './pages/_pages'
import { Forbidden, NotFound } from './pages/error'
import { TeacherState } from './types/enums'
import { Role } from './types/user'

export type NavigateState = { from: Location }

const ProtectedRoute: React.FC<{ roles?: Role[] }> = ({
  children,
  roles = [],
}) => {
  const { isAuthed, hasRole, decodeToken, API } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // force non-employed teacher to /application
    if (
      location.pathname !== '/application' &&
      isAuthed() &&
      hasRole(Role.TEACHER)
    ) {
      API.get('users/teacher/me').then((res) => {
        if ((res.data.state as TeacherState) !== TeacherState.EMPLOYED) {
          navigate('/application', { replace: true })
        }
      })
    }
  }, [])

  if (!isAuthed()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  } else if (roles.length > 0 && !roles.some((r) => r === decodeToken().role)) {
    return <Forbidden />
  }

  return <>{children}</>
}

const theme = createTheme()

const App: React.FC = () => {
  const { isAuthed } = useAuth()

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'de'}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
              <Route path="timetable">
                <Route
                  path=""
                  element={
                    <ProtectedRoute>
                      <Pages.Timetable />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":contractId/:date"
                  element={
                    <ProtectedRoute>
                      <Pages.LessonDetailView />
                    </ProtectedRoute>
                  }
                />
              </Route>
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
                path="profile"
                element={
                  <ProtectedRoute>
                    <Pages.TeacherDetailView />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route
              path="application"
              element={
                <ProtectedRoute roles={[Role.TEACHER]}>
                  <Pages.TeacherDetailView />
                </ProtectedRoute>
              }
            />

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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </SnackbarProvider>
      </ThemeProvider>
    </LocalizationProvider>
  )
}

export default App
