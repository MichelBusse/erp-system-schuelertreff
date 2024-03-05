import { Box, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const ErrorPage: React.FC<{ code: string; message: string }> = ({
  code,
  message,
}) => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        height: `calc(100vh - 64px)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Typography variant="h4">{code}</Typography>
        <Typography variant="subtitle1">{message}</Typography>
        <Button
          aria-label="home"
          style={{ marginTop: 20 }}
          onClick={() => navigate('/')}
        >
          Startseite
        </Button>
      </div>
    </Box>
  )
}

export default ErrorPage

export const Forbidden: React.FC = () => (
  <ErrorPage code="403" message="Fehlende Berechtigung" />
)

export const NotFound: React.FC = () => (
  <ErrorPage code="404" message="Seite nicht gefunden" />
)
