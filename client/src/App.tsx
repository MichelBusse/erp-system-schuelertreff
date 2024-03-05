import './core/styles/globals.scss'

import { CssBaseline } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { SnackbarProvider } from 'notistack'
import { useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { TeacherState } from './core/types/enums'
import { Role } from './core/types/user'
import { useAuth } from './features/auth/components/AuthProvider'
import { Forbidden, NotFound } from './features/general/pages/Error'
import Layout from './features/general/components/Layout'
import Cockpit from './features/dashboard/pages/Cockpit'
import Timetable from './features/timetable/pages/Timetable'
import TeacherOverview from './features/teachers/pages/TeacherOverview'
import LessonDetailView from './features/timetable/pages/LessonDetailView'
import PrivateCustomers from './features/customers/pages/PrivateCustomers'
import PrivateCustomerDetailView from './features/customers/pages/PrivateCustomersDetailView'
import Schools from './features/customers/pages/Schools'
import SchoolDetailView from './features/customers/pages/SchoolDetailView'
import Teachers from './features/teachers/pages/Teachers'
import TeacherDetailView from './features/teachers/pages/TeacherDetailView'
import Applicants from './features/teachers/pages/Applicants'
import Subjects from './features/subjects/pages/Subjects'
import Login from './features/auth/pages/Login'
import Reset from './features/auth/pages/Reset'

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
    return <Forbidden />
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

export type PrevIdProps = {
  prevId?: number
  setPrevId?: React.Dispatch<React.SetStateAction<number | undefined>>
}

const App: React.FC = () => {
  const { isAuthed, hasRole } = useAuth()
  const [prevId, setPrevId] = useState<number>()

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
                    <Cockpit />
                  </ProtectedRoute>
                }
              ></Route>
              <Route path="timetable">
                <Route
                  path=""
                  element={
                    <ProtectedRoute>
                      <Timetable />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teacher/:id"
                  element={
                    <ProtectedRoute>
                      <TeacherOverview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":initialDate/:contractId/:date"
                  element={
                    <ProtectedRoute>
                      <LessonDetailView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":contractId/:date"
                  element={
                    <ProtectedRoute>
                      <LessonDetailView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":initialDate"
                  element={
                    <ProtectedRoute>
                      <Timetable />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="privateCustomers">
                <Route
                  path=""
                  element={
                    <ProtectedRoute>
                      <PrivateCustomers
                        prevId={prevId}
                        setPrevId={setPrevId}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":id"
                  element={
                    <ProtectedRoute>
                      <PrivateCustomerDetailView />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="schools">
                <Route
                  path=""
                  element={
                    <ProtectedRoute>
                      <Schools prevId={prevId} setPrevId={setPrevId} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":id"
                  element={
                    <ProtectedRoute>
                      <SchoolDetailView />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="teachers">
                <Route
                  path=""
                  element={
                    <ProtectedRoute>
                      <Teachers prevId={prevId} setPrevId={setPrevId} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":id"
                  element={
                    <ProtectedRoute>
                      <TeacherDetailView />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="applicants">
                <Route
                  path=""
                  element={
                    <ProtectedRoute>
                      <Applicants prevId={prevId} setPrevId={setPrevId} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":id"
                  element={
                    <ProtectedRoute>
                      <TeacherDetailView />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route
                path="subjects"
                element={
                  <ProtectedRoute>
                    <Subjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    {hasRole(Role.SCHOOL) ? <SchoolDetailView /> : null}
                    {hasRole(Role.TEACHER) ? <TeacherDetailView /> : null}
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route
              path="login"
              element={
                !isAuthed() ? (
                  <Login />
                ) : (
                  <Navigate to="/" replace={true} />
                )
              }
            />

            <Route path="reset">
              <Route path="" element={<Navigate to="/" replace={true} />} />
              <Route path=":token" element={<Reset />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </SnackbarProvider>
      </ThemeProvider>
    </LocalizationProvider>
  )
}

export default App
