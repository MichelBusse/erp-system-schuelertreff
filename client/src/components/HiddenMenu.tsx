import { Box, Button, Drawer } from '@mui/material'

import { SideMenu } from '../pages/timetable'

type Props = {
  state: SideMenu
  close: () => void
}

const HiddenMenu: React.FC<Props> = ({ state, close }) => (
  <Drawer
    variant="persistent"
    anchor="right"
    open={state.open}
    PaperProps={{
      style: {
        width: 240,
        padding: 20,
        overflowX: 'hidden',
      },
    }}
  >
    <Box>{state.content}</Box>
    <Button
      variant="text"
      size="medium"
      onClick={close}
      sx={{ marginTop: 'auto' }}
    >
      schließen
    </Button>
  </Drawer>
)

export default HiddenMenu
