import React, { useState } from 'react'
import { NavLink as NavLinkBase, NavLinkProps } from 'react-router-dom'
import {
  Button,
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
import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
} from '@mui/icons-material'
import { Box } from '@mui/system'
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

export type MainMenuProps = {
  items: Array<{
    icon: typeof SvgIcon
    text: string
    href: string
  }>
}

const MainMenu: React.FC<MainMenuProps> = ({ items }) => {
  const [open, setOpen] = useState(true)
  const toggleDrawer = () => setOpen(!open)
  const { token, isAuthed, handleLogout } = useAuth()

  return (
    <StyledDrawer variant="permanent" open={open}>
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
      <Divider />
      <List component="nav">
        {items.map((item, i) => (
          <ListItemButton key={i} component={NavLink} to={item.href}>
            <ListItemIcon>
              <item.icon />
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      {isAuthed() && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <p>{token}</p>
        <Button onClick={() => handleLogout()}>Logout</Button>
      </Box>}
    </StyledDrawer>
  )
}

export default MainMenu
