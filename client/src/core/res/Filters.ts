import { GridCellParams, GridFilterItem, GridFilterOperator } from "@mui/x-data-grid"
import SchoolTypeFilterInput from "../../features/customers/components/SchoolTypeFilterInput"

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