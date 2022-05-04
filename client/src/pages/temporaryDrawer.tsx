import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

type Anchor = 'top' | 'left' | 'bottom' | 'right';

export default function TemporaryDrawer() {
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  //wird bei einem Klick auf einen Button aufgerufen
  //besitzt 2 Parameter, einmal anchor(die Richtung(top, left,...)) und open(der Zustand(true or false))
  const toggleDrawer =
    (anchor: Anchor, open: boolean) => //
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setState({ ...state, [anchor]: open });
    };

    {/* ist das eigentliche side menü, nimmt als Parameter die Richtung */}
  const list = (anchor: Anchor) => (
    <Box
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>
              {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>
              {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
        {/*.map function erzeugt alle 4 Richtungen durch und erzeugt Button und Drawer dazu*/}
      {(['left', 'right', 'top', 'bottom'] as const).map((anchor) => (
        <React.Fragment key={anchor}>
            {/* bei klick auf den Button wird anchor(die Richtung) und true an toggleDrawer geschickt (side menü öffnet sich)*/}
          <Button onClick={toggleDrawer(anchor, true)}>{anchor}</Button>
           {/* ist die versteckte anzeige, die erst bei buttonklick sichtbar wird*/}
          <Drawer
             /*anchor=Richtung*/
            anchor={anchor}
            /*open nimmt einen Booleanwert, ob offen oder geschlossen*/
            open={state[anchor]}
             /* bei klick auf den Button wird anchor(die Richtung) und false an toggleDrawer geschickt (side menü schließt sich)*/
            onClose={toggleDrawer(anchor, false)}
          >
              {/* ist das eigentliche side menü im Drawer*/}
            {list(anchor)} 
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  );
}