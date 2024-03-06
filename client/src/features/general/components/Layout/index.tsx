import { Box, useTheme } from '@mui/material'
import { ErrorBoundary } from 'react-error-boundary'
import { Outlet } from 'react-router-dom'
import MainMenu from '../MainMenu'
import { useAuth } from '../../../auth/components/AuthProvider'
import ErrorPage from '../../pages/Error'
import BottomMenu from '../BottomMenu'
import TeacherState from '../../../../core/enums/TeacherState'
import MenuItems from '../../../../core/res/MenuItems'

const Layout: React.FC = () => {
  const theme = useTheme()
  const { isAuthed, decodeToken } = useAuth()

  return (
    <Box sx={{ display: 'flex' }}>
      {
        // hide menu for non-employed teachers
        !(
          isAuthed() &&
          decodeToken().role === 'teacher' &&
          decodeToken().state !== TeacherState.EMPLOYED
        ) && <MainMenu items={MenuItems} />
      }
      <Box
        component="main"
        sx={{
          backgroundColor: theme.palette.grey[100],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <ErrorBoundary
          FallbackComponent={() => (
            <ErrorPage code="" message="Ein Fehler ist aufgetreten" />
          )}
        >
          <Outlet />
        </ErrorBoundary>
        {
          // hide menu for non-employed teachers
          !(
            isAuthed() &&
            decodeToken().role === 'teacher' &&
            decodeToken().state !== TeacherState.EMPLOYED
          ) && <BottomMenu items={MenuItems} />
        }
      </Box>
    </Box>
  )
}

export default Layout
