import {
  AccountBalance as AccountBalanceIcon,
  Layers as LayersIcon,
  ManageAccounts as ManageAccountsIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material'
import ExploreIcon from '@mui/icons-material/Explore'
import { Box, useTheme } from '@mui/material'
import { Outlet } from 'react-router-dom'

import { TeacherState } from '../types/enums'
import { useAuth } from './AuthProvider'
import BottomMenu from './BottomMenu'
import MainMenu from './MainMenu'

const menuItems = [
  {
    icon: ExploreIcon,
    text: 'Cockpit',
    href: '/cockpit',
    roles: ['admin'],
  },
  {
    icon: TableChartIcon,
    text: 'Stundenplan',
    href: '/timetable',
  },
  {
    icon: SchoolIcon,
    text: 'Lehrkräfte',
    href: '/teachers',
    roles: ['admin'],
  },
  {
    icon: PeopleIcon,
    text: 'Privatkunden',
    href: '/privateCustomers',
    roles: ['admin'],
  },
  {
    icon: AccountBalanceIcon,
    text: 'Schulen',
    href: '/schools',
    roles: ['admin'],
  },
  {
    icon: LayersIcon,
    text: 'Fächer',
    href: '/subjects',
    roles: ['admin'],
  },
  {
    icon: ManageAccountsIcon,
    text: 'Profil',
    href: '/profile',
    roles: ['teacher'],
  },
]

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
        ) && <MainMenu items={menuItems} />
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
        {
          // hide menu for non-employed teachers
          !(
            isAuthed() &&
            decodeToken().role === 'teacher' &&
            decodeToken().state !== TeacherState.EMPLOYED
          ) && <BottomMenu items={menuItems} />
        }
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout
