import { FormControl, InputLabel, NativeSelect } from '@mui/material'
import { GridFilterInputValueProps } from '@mui/x-data-grid'
import TeacherState from '../../../../core/enums/TeacherState.enum'
import { teacherStateToString } from '../../../../core/utils/EnumToString'

export default function TeacherStateFilterInput({
  item,
  applyValue,
}: GridFilterInputValueProps) {
  return (
    <FormControl fullWidth>
      <InputLabel variant="standard" htmlFor="state-select">
        Status
      </InputLabel>
      <NativeSelect
        inputProps={{
          name: 'state',
          id: 'state-select',
        }}
        defaultValue={''}
        required
        onChange={(event) => {
          applyValue({ ...item, value: event.target.value })
        }}
      >
        <option value={''}></option>
        {Object.values(TeacherState).map((state) => (
          <option key={state} value={state}>
            {teacherStateToString[state]}
          </option>
        ))}
      </NativeSelect>
    </FormControl>
  )
}
