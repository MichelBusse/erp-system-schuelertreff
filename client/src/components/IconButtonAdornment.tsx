import {
  IconButton,
  InputAdornment,
  Tooltip,
  TooltipProps,
} from '@mui/material'
import SvgIcon from '@mui/material/SvgIcon'

type Props = {
  icon: typeof SvgIcon
  position?: 'start' | 'end'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  margin?: string | number
  hidden?: boolean
  disabled?: boolean
  tooltip?: TooltipProps['title']
}

const IconButtonAdornment: React.FC<Props> = ({
  icon: Icon,
  position = 'end',
  onClick,
  margin = '-4px',
  hidden = false,
  disabled = false,
  tooltip = '',
}) => (
  <InputAdornment position={position}>
    <Tooltip title={tooltip}>
      <div>
        <IconButton
          disabled={hidden || disabled}
          onClick={onClick}
          sx={{ margin: margin, opacity: hidden ? 0 : 1 }}
          size="small"
        >
          <Icon fontSize="small" />
        </IconButton>
      </div>
    </Tooltip>
  </InputAdornment>
)

export default IconButtonAdornment
