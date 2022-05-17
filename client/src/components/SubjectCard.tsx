import { Grid, Paper } from "@mui/material"
import { styled } from "@mui/material/styles"

type Props = {
    color: string,
    subjectName: string,
}

const Item = styled(Paper)(() => ({
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }));

const SubjectCard: React.FC<Props> = ({color, subjectName}) => {
    return (
        <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
            <Item>{subjectName}
                <div style={{   width: '100%', 
                                height: '90px', 
                                backgroundColor: color,
                                opacity: 0.5, 
                                marginTop: '10px'  }}>
                </div>
            </Item>
        </Grid>
    )
  }
  
  export default SubjectCard
  