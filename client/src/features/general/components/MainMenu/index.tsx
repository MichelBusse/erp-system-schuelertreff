import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
} from '@mui/icons-material'
import LogoutIcon from '@mui/icons-material/Logout'
import {
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SvgIcon,
  Toolbar,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Box } from '@mui/system'
import React, { useState } from 'react'
import logo from '../../../../core/assets/logoLarge.png'
import { useAuth } from '../../../auth/components/AuthProvider'
import MenuLink from '../MenuLink'
import MainMenuDrawer from '../MainMenuDrawer'

export type Props = {
  items: Array<{
    icon: typeof SvgIcon
    text: string
    href: string
    roles?: string[]
  }>
}

const MainMenu: React.FC<Props> = ({ items }) => {
  const [open, setOpen] = useState(true)
  const toggleDrawer = () => setOpen(!open)
  const { isAuthed, handleLogout, decodeToken } = useAuth()

  const theme = useTheme()

  return (
    <MainMenuDrawer
      variant="permanent"
      open={open}
      sx={{
        height: '100vh',
        [theme.breakpoints.down('md')]: {
          display: 'none',
        },
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: [1],
        }}
      >
        <IconButton onClick={toggleDrawer}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>
      <img
        src={logo}
        alt="Schülertreff"
        style={{
          marginLeft: '10%',
          marginRight: '10%',
          marginBottom: '10%',
          userSelect: 'none',
        }}
      />
      <Divider />
      <List component="nav">
        {items
          .filter(
            (item) =>
              typeof item.roles === 'undefined' ||
              (isAuthed() && item.roles.includes(decodeToken().role)),
          )
          .map((item, i) => (
            <ListItemButton key={i} component={MenuLink} to={item.href}>
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
      </List>
      <Divider />
      {isAuthed() && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 1,
          }}
        >
          {open && <span>{decodeToken().username}</span>}
          <IconButton onClick={() => handleLogout()}>
            <LogoutIcon />
          </IconButton>
        </Box>
      )}
    </MainMenuDrawer>
  )
}

export default MainMenu
