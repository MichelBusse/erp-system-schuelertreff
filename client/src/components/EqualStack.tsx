import { Stack } from '@mui/material'

const EqualStack: React.FC<React.ComponentProps<typeof Stack>> = (props) => (
  <Stack
    {...props}
    sx={{
      '&>*': {
        flexBasis: 0,
        flexGrow: 1,
      },
      ...props.sx,
    }}
  />
)

export default EqualStack
