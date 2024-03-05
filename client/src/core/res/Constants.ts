import { GridLocaleText } from '@mui/x-data-grid'
import { OptionsObject as SnackbarOptions } from 'notistack'

export const SNACKBAR_OPTIONS: SnackbarOptions = {
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left',
  },
}

export const SNACKBAR_OPTIONS_ERROR: SnackbarOptions = {
  ...SNACKBAR_OPTIONS,
  variant: 'error',
}

export const DATA_GRID_LOCALE_TEXT: Partial<GridLocaleText> = {
  filterPanelColumns: 'Spalte',
  filterPanelOperators: 'Operator',
  filterPanelInputLabel: 'Wert',
  filterOperatorContains: 'enthält',
  filterPanelInputPlaceholder: 'Eingabe',
  noRowsLabel: 'Keine Einträge',
  MuiTablePagination: { labelRowsPerPage: 'Einträge pro Seite:' },
}