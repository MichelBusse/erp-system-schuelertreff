import { IconButton, InputAdornment } from '@mui/material'
import SvgIcon from '@mui/material/SvgIcon'

type Props = {
  icon: typeof SvgIcon
  position?: 'start' | 'end'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  margin?: string | number
  hidden?: boolean
}

const IconButtonAdornment: React.FC<Props> = ({
  icon: Icon,
  position = 'end',
  onClick,
  margin = '-4px',
  hidden = false,
}) => (
  <InputAdornment position={position}>
    <IconButton
      disabled={hidden}
      onClick={onClick}
      sx={{ margin: margin, opacity: hidden ? 0 : 1 }}
      size="small"
    >
      <Icon fontSize="small" />
    </IconButton>
  </InputAdornment>
)

export default IconButtonAdornment
