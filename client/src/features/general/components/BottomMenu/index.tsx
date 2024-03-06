import LogoutIcon from '@mui/icons-material/Logout'
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  SvgIcon,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import React from 'react'
import { useAuth } from '../../../auth/components/AuthProvider'
import MenuLink from '../MenuLink'

export type Props = {
  items: Array<{
    icon: typeof SvgIcon
    text: string
    href: string
    roles?: string[]
  }>
}

const BottomMenu: React.FC<Props> = ({ items }) => {
  const { isAuthed, handleLogout, decodeToken } = useAuth()

  const theme = useTheme()

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}
    >
      <BottomNavigation
        showLabels
        sx={{
          display: 'none',
          [theme.breakpoints.down('md')]: {
            display: 'flex',
          },
        }}
      >
        {items
          .filter(
            (item) =>
              typeof item.roles === 'undefined' ||
              (isAuthed() && item.roles.includes(decodeToken().role)),
          )
          .map((item, i) => (
            <BottomNavigationAction
              key={i}
              component={MenuLink}
              icon={<item.icon />}
              to={item.href}
              sx={{ minWidth: '0px' }}
            />
          ))}
        <BottomNavigationAction
          icon={<LogoutIcon />}
          onClick={() => handleLogout()}
          sx={{ minWidth: '0px' }}
        />
      </BottomNavigation>
    </Paper>
  )
}

export default BottomMenu
