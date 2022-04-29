import { Button, TextField, Grid, Paper } from "@mui/material"
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

const LoginComponent: React.FC = () => {
    return (
    <>
        <Grid container direction="column" justifyContent="center" alignItems="center" style={{height: "90vh"}}>
            <TextField id="outlined-basic" label="E-Mail" variant="outlined" size="small" style={{margin: "5px"}}/>
            <TextField id="outlined-password-input" label="Password" type="password" autoComplete="current-password" size="small" style={{margin: "5px"}}/>
            <Button variant="outlined" size="medium" style={{margin: "5px"}}>Login</Button>
        </Grid>
    </>)
  }
  
  export default LoginComponent