import './globals.scss'

import { CssBaseline } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { SnackbarProvider } from 'notistack'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { useAuth } from './components/AuthProvider'
import Layout from './components/Layout'
import Pages from './pages/_pages'
import * as Error from './pages/error'
import { TeacherState } from './types/enums'
import { Role } from './types/user'

export type NavigateState = { from: Location }

const ProtectedRoute: React.FC<{ roles?: Role[] }> = ({
  children,
  roles = [],
}) => {
  const { isAuthed, hasRole, decodeToken } = useAuth()
  const location = useLocation()

  // force non-employed teacher to profile page
  if (
    location.pathname !== '/profile' &&
    isAuthed() &&
    hasRole(Role.TEACHER) &&
    decodeToken().state !== TeacherState.EMPLOYED
  ) {
    return <Navigate to="/profile" replace />
  }

  if (!isAuthed()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  } else if (roles.length > 0 && !roles.some((r) => r === decodeToken().role)) {
    return <Error.Forbidden />
  }

  return <>{children}</>
}

const theme = createTheme({
  palette: {
    // TODO: custom primary color with sufficient contrast
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Color_contrast
    // primary: {
    //   main: '#54e2fd',
    // },
  },
})

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
              <Route
                path="cockpit"
                element={
                  <ProtectedRoute>
                    <Pages.Cockpit />
                  </ProtectedRoute>
                }
              ></Route>
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
                  path=":initialDate/:contractId/:date"
                  element={
                    <ProtectedRoute>
                      <Pages.LessonDetailView />
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
                <Route
                  path=":initialDate"
                  element={
                    <ProtectedRoute>
                      <Pages.Timetable />
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
              <Route path="schools">
                <Route
                  path=""
                  element={
                    <ProtectedRoute>
                      <Pages.Schools />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":id"
                  element={
                    <ProtectedRoute>
                      <Pages.SchoolDetailView />
                    </ProtectedRoute>
                  }
                />
              </Route>
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

            <Route path="*" element={<Error.NotFound />} />
          </Routes>
        </SnackbarProvider>
      </ThemeProvider>
    </LocalizationProvider>
  )
}

export default App
