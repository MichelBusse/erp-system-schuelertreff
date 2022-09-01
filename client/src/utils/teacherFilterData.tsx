import {
  Autocomplete,
  Box,
  FormControl,
  InputLabel,
  NativeSelect,
  TextField,
} from '@mui/material'
import {
  GridCellParams,
  GridFilterInputValueProps,
  GridFilterItem,
  GridFilterOperator,
} from '@mui/x-data-grid'
import { useEffect, useState } from 'react'

import { useAuth } from '../components/AuthProvider'
import {
  teacherSchoolTypeToString,
  teacherStateToString,
} from '../consts'
import { Degree, TeacherSchoolType, TeacherState } from '../types/enums'
import subject from '../types/subject'

//definition of subject filter input
export const SubjectsFilterInputValue: React.FC<GridFilterInputValueProps> = ({
  item,
  applyValue,
}) => {
  const { API } = useAuth()

  const [subjects, setSubjects] = useState<subject[]>([])

  useEffect(() => {
    API.get(`subjects`).then((res) => setSubjects(res.data))
  }, [])

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
        id="subjects"
        options={subjects}
        getOptionLabel={(option) => option.name}
        value={item.value}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Fächer *"
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

export const DegreeFilterInputValue: React.FC<GridFilterInputValueProps> = ({
  item,
  applyValue,
}) => (
  <FormControl fullWidth>
    <InputLabel variant="standard" htmlFor="degree-select">
      Höchster Abschluss
    </InputLabel>
    <NativeSelect
      inputProps={{
        name: 'degree',
        id: 'degree-select',
      }}
      defaultValue={Degree.NOINFO}
      required
      onChange={(event) => {
        applyValue({ ...item, value: event.target.value })
      }}
    >
      <option value={Degree.NOINFO}>Keine Angabe</option>
      <option value={Degree.HIGHSCHOOL}>Abitur</option>
      <option value={Degree.BACHELOR}>Bachelor</option>
      <option value={Degree.MASTER}>Master</option>
    </NativeSelect>
  </FormControl>
)

export const StateFilterInputValue: React.FC<GridFilterInputValueProps> = ({
  item,
  applyValue,
}) => (
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

export const SchoolTypesFilterValue: React.FC<GridFilterInputValueProps> = ({
  item,
  applyValue,
}) => (
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

//definition of filter operators
export const subjectOperator: GridFilterOperator = {
  label: 'enthalten',
  value: 'includes',
  getApplyFilterFn: (filterItem: GridFilterItem) => {
    if (
      !filterItem.columnField ||
      !filterItem.value ||
      !filterItem.operatorValue
    ) {
      return null
    }

    return (params: GridCellParams): boolean => {
      return params.value
        .map((sub: subject) => sub.name)
        .includes(filterItem.value.name)
    }
  },
  InputComponent: SubjectsFilterInputValue,
  InputComponentProps: { type: 'string' },
}

export const degreeOperator: GridFilterOperator = {
  label: 'mindestens',
  value: 'mininum',
  getApplyFilterFn: (filterItem: GridFilterItem) => {
    if (
      !filterItem.columnField ||
      !filterItem.value ||
      !filterItem.operatorValue
    ) {
      return null
    }

    return (params: GridCellParams): boolean => {
      switch (filterItem.value) {
        case Degree.NOINFO:
          return true
        case Degree.HIGHSCHOOL:
          return (
            params.value === Degree.HIGHSCHOOL ||
            params.value === Degree.BACHELOR ||
            params.value === Degree.MASTER
          )
        case Degree.BACHELOR:
          return (
            params.value === Degree.BACHELOR || params.value === Degree.MASTER
          )
        case Degree.MASTER:
          return params.value === Degree.MASTER
        default:
          return false
      }
    }
  },
  InputComponent: DegreeFilterInputValue,
  InputComponentProps: { type: 'string' },
}

export const stateOperator: GridFilterOperator = {
  label: 'ist',
  value: 'is',
  getApplyFilterFn: (filterItem: GridFilterItem) => {
    if (
      !filterItem.columnField ||
      !filterItem.value ||
      !filterItem.operatorValue
    ) {
      return null
    }

    return (params: GridCellParams) => params.value === filterItem.value
  },
  InputComponent: StateFilterInputValue,
  InputComponentProps: { type: 'string' },
}

export const schoolTypesOperator: GridFilterOperator = {
  label: 'enthalten',
  value: 'includes',
  getApplyFilterFn: (filterItem: GridFilterItem) => {
    if (
      !filterItem.columnField ||
      !filterItem.value ||
      !filterItem.operatorValue
    ) {
      return null
    }

    return (params: GridCellParams): boolean => {
      return params.value.includes(filterItem.value)
    }
  },
  InputComponent: SchoolTypesFilterValue,
  InputComponentProps: { type: 'string' },
}