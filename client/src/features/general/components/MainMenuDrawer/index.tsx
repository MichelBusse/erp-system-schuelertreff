import { Drawer, styled } from "@mui/material"

const drawerWidth = 240

const MainMenuDrawer = styled(Drawer, {
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

export default MainMenuDrawer;