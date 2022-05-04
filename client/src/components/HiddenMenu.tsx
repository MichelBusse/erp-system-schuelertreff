import Drawer from '@mui/material/Drawer'
import React from 'react'
import { Button, styled } from '@mui/material';

type Props = {
    open: {state: boolean
           info: string}
    setOpen: Function
}

const StyledDrawer = styled(Drawer)(() => ({
    '& .MuiDrawer-paper': {
        // styles like width: 100,
        padding: 20
    }
  }))

const HiddenMenu: React.FC<Props> = ({ open, setOpen }) => {

    const HiddenMenuContent = () => {
        return(<>
            <ul>
                <li>ersten</li>
                <li>zweitens</li>
                <li>Lehrername: {open.info}</li>
            </ul>
            <Button variant="outlined" size="large" onClick = {() => setOpen({state: false, info: "standard"})}>Details Schließen</Button>
        </>)
    }

    return (<>
        <StyledDrawer variant='persistent'
        sx={{width: 500}}
          /*anchor=Richtung*/
         anchor='right'
         /*open nimmt einen Booleanwert, ob offen oder geschlossen*/
         open = {open.state}
          /* bei klick auf den Button wird anchor(die Richtung) und false an toggleDrawer geschickt (side menü schließt sich)*/
   >
           {/* ist das eigentliche side menü im Drawer*/}
            {HiddenMenuContent()}
        </StyledDrawer>
    </>)
  }
  
  export default HiddenMenu