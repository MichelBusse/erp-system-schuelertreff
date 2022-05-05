import { Box, Grid } from "@mui/material";
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import GridLine from '../components/GridLine';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const Teachers: React.FC = () => {
  return (<Box sx={{ flexGrow: 1 }}>
    <Grid container rowSpacing={2}>
    {[1, 2, 3, 4].map( (number) => (
        <Grid item xs={12} key={number}>
          <Item>
            <Grid container spacing={2}>
              <Grid item xs={3}>
            <Grid item xs={6}>
                Lehrer Name
            </Grid>
              </Grid>
            {[1, 2, 3, 4].map( (number) => (
              <Grid item xs="auto" key={number}>
                <Item sx={{backgroundColor: 'rgba(204, 204, 204, 0.5)'}}>
                  Inneren {number}
                </Item>
              </Grid>
            ))}
            </Grid>            
          </Item>
      </Grid>
    ))}
    </Grid>
  </Box>)
}

export default Teachers
