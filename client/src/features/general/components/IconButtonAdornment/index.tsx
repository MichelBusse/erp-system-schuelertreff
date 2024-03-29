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
  color?: React.ComponentProps<typeof IconButton>['color']
}

const IconButtonAdornment: React.FC<Props> = ({
  icon: Icon,
  position = 'end',
  onClick,
  margin = '-4px',
  hidden = false,
  disabled = false,
  tooltip = '',
  color,
}) => (
  <InputAdornment position={position} sx={{ margin: margin }}>
    <Tooltip title={tooltip}>
      <div>
        <IconButton
          disabled={hidden || disabled}
          onClick={onClick}
          sx={{ opacity: hidden ? 0 : 1 }}
          size="small"
          color={color}
        >
          <Icon fontSize="small" />
        </IconButton>
      </div>
    </Tooltip>
  </InputAdornment>
)

export default IconButtonAdornment
