import { FormControl, InputLabel, NativeSelect } from '@mui/material'
import { GridFilterInputValueProps } from '@mui/x-data-grid'
import TeacherSchoolType from '../../../../core/enums/TeacherSchoolType.enum'
import { teacherSchoolTypeToString } from '../../../../core/utils/EnumToString'

export default function TeacherSchoolTypesFilterInput({
  item,
  applyValue,
}: GridFilterInputValueProps) {
  return (
    <FormControl fullWidth>
      <InputLabel variant="standard" htmlFor="degree-select">
        Schulart
      </InputLabel>
      <NativeSelect
        inputProps={{
          name: 'degree',
          id: 'degree-select',
        }}
        required
        onChange={(event) => {
          applyValue({ ...item, value: event.target.value })
        }}
      >
        <option value={''}></option>
        {Object.values(TeacherSchoolType).map((schoolType) => (
          <option key={schoolType} value={schoolType}>
            {teacherSchoolTypeToString[schoolType]}
          </option>
        ))}
      </NativeSelect>
    </FormControl>
  )
}
