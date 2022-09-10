import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
} from '@mui/icons-material'
import LogoutIcon from '@mui/icons-material/Logout'
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  SvgIcon,
  Toolbar,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Box } from '@mui/system'
import React, { useState } from 'react'
import { NavLink as NavLinkBase, NavLinkProps } from 'react-router-dom'

import logo from '../assets/logoLarge.png'
import { useAuth } from './AuthProvider'

const drawerWidth = 240

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: open ? drawerWidth : theme.spacing(7.25),
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.easeInOut,
      duration:
        theme.transitions.duration[open ? 'leavingScreen' : 'enteringScreen'],
    }),
    boxSizing: 'border-box',
    overflowX: 'hidden',
  },
}))

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  (props, ref) => (
    <NavLinkBase
      ref={ref}
      {...props}
      className={({ isActive }) =>
        `${props.className} ${isActive && 'Mui-selected'}`
      }
    />
  ),
)
NavLink.displayName = 'NavLink' // for debugging

export type MainMenuProps = {
  items: Array<{
    icon: typeof SvgIcon
    text: string
    href: string
    roles?: string[]
  }>
}

const MainMenu: React.FC<MainMenuProps> = ({ items }) => {
  const [open, setOpen] = useState(true)
  const toggleDrawer = () => setOpen(!open)
  const { isAuthed, handleLogout, decodeToken } = useAuth()

  const theme = useTheme()

  return (
    <StyledDrawer
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
            <ListItemButton key={i} component={NavLink} to={item.href}>
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
    </StyledDrawer>
  )
}

export default MainMenu
