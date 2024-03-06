import { Autocomplete, Box, TextField } from '@mui/material'
import SchoolType from '../../../../core/enums/SchoolType.enum'
import { GridFilterInputValueProps } from '@mui/x-data-grid'

export default function SchoolTypeFilterInput({
  item,
  applyValue,
}: GridFilterInputValueProps) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
      }}
    >
      <Autocomplete
        id="schoolTypes"
        options={[
          SchoolType.GRUNDSCHULE,
          SchoolType.OBERSCHULE,
          SchoolType.GYMNASIUM,
          SchoolType.ANDERE,
        ]}
        getOptionLabel={(option) => {
          switch (option) {
            case SchoolType.GRUNDSCHULE:
              return 'Grundschule'
            case SchoolType.OBERSCHULE:
              return 'Oberschule'
            case SchoolType.GYMNASIUM:
              return 'Gymnasium'
            case SchoolType.ANDERE:
              return 'Andere'
            default:
              return ''
          }
        }}
        value={item.value}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Schulart"
            sx={{ minWidth: '150px' }}
          />
        )}
        onChange={(event, newValue) => {
          applyValue({ ...item, value: newValue })
        }}
      />
    </Box>
  )
}
