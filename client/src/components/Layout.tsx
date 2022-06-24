import {
  AccountBalance as AccountBalanceIcon,
  Layers as LayersIcon,
  ManageAccounts as ManageAccountsIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material'
import { Box, CssBaseline, useTheme } from '@mui/material'
import { Outlet } from 'react-router-dom'

import MainMenu from './MainMenu'

const menuItems = [
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
    href: '/schoolCustomers',
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
    href: '/profil',
  },
]

const Layout: React.FC = () => {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <MainMenu items={menuItems} />
      <Box
        component="main"
        sx={{
          backgroundColor: theme.palette.grey[100],
          flexGrow: 1,
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout
