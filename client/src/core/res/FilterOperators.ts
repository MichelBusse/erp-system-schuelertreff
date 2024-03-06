import { GridCellParams, GridFilterItem, GridFilterOperator } from "@mui/x-data-grid"
import SchoolTypeFilterInput from "../../features/customers/components/SchoolTypeFilterInput"
import SubjectsFilterInput from "../../features/teachers/components/SubjectsFilterInput"
import Subject from "../types/Subject"
import TeacherDegree from "../enums/TeacherDegree.enum"
import TeacherDegreeFilterInput from "../../features/teachers/components/TeacherDegreeFilterInput"
import TeacherStateFilterInput from "../../features/teachers/components/TeacherStateFilterInput"
import TeacherSchoolTypesFilterInput from "../../features/teachers/components/TeacherSchoolTypeFilterInput"

export const SchoolTypeFilterOperator: GridFilterOperator = {
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
  InputComponent: SchoolTypeFilterInput,
  InputComponentProps: { type: 'string' },
}

//definition of filter operators
export const SubjectsFilterOperator: GridFilterOperator = {
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
        .map((sub: Subject) => sub.name)
        .includes(filterItem.value.name)
    }
  },
  InputComponent: SubjectsFilterInput,
  InputComponentProps: { type: 'string' },
}

export const TeacherDegreeFilterOperator: GridFilterOperator = {
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
        case TeacherDegree.NOINFO:
          return true
        case TeacherDegree.HIGHSCHOOL:
          return (
            params.value === TeacherDegree.HIGHSCHOOL ||
            params.value === TeacherDegree.BACHELOR ||
            params.value === TeacherDegree.MASTER
          )
        case TeacherDegree.BACHELOR:
          return (
            params.value === TeacherDegree.BACHELOR ||
            params.value === TeacherDegree.MASTER
          )
        case TeacherDegree.MASTER:
          return params.value === TeacherDegree.MASTER
        default:
          return false
      }
    }
  },
  InputComponent: TeacherDegreeFilterInput,
  InputComponentProps: { type: 'string' },
}

export const TeacherStateFilterOperator: GridFilterOperator = {
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
  InputComponent: TeacherStateFilterInput,
  InputComponentProps: { type: 'string' },
}

export const TeacherSchoolTypeFilterOperator: GridFilterOperator = {
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
  InputComponent: TeacherSchoolTypesFilterInput,
  InputComponentProps: { type: 'string' },
}
