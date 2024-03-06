import { FormControl, InputLabel, NativeSelect } from "@mui/material"
import { GridFilterInputValueProps } from "@mui/x-data-grid"
import TeacherDegree from "../../../../core/enums/TeacherDegree.enum"

export default function TeacherDegreeFilterInput({
  item,
  applyValue,
}: GridFilterInputValueProps) {
  return (
    <FormControl fullWidth>
      <InputLabel variant="standard" htmlFor="degree-select">
        Höchster Abschluss
      </InputLabel>
      <NativeSelect
        inputProps={{
          name: 'degree',
          id: 'degree-select',
        }}
        defaultValue={TeacherDegree.NOINFO}
        required
        onChange={(event) => {
          applyValue({ ...item, value: event.target.value })
        }}
      >
        <option value={TeacherDegree.NOINFO}>Keine Angabe</option>
        <option value={TeacherDegree.HIGHSCHOOL}>Abitur</option>
        <option value={TeacherDegree.BACHELOR}>Bachelor</option>
        <option value={TeacherDegree.MASTER}>Master</option>
      </NativeSelect>
    </FormControl>
  )
}
