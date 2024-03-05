import { Box, useTheme } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import dayjs, { Dayjs } from 'dayjs'

import styles from './styles.module.scss'
import { DrawerParameters } from '../../pages/Timetable'
import { Contract } from '../../../../core/types/Contract'
import Lesson from '../../../../core/types/Lesson'

type Props = {
  date: Dayjs
  setDrawer: (params: DrawerParameters) => void
  contracts: Record<number, Contract[]>
  lessons: Lesson[]
  labels: { id: number; title: string }[]
}

const MultiCalendar: React.FC<Props> = ({
  date,
  setDrawer,
  contracts,
  lessons,
  labels,
}) => {
  const theme = useTheme()

  const getCellValue: GridColDef['valueGetter'] = ({ id, colDef: { field } }) =>
    contracts[id as number]?.filter(
      (c) => dayjs(c.startDate).day().toString() === field,
    )

  const renderCell: GridColDef['renderCell'] = (params) => (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        cursor: (params.value ?? []).length > 0 ? 'pointer' : 'normal',
      }}
    >
      {(params.value as Contract[])?.map((c) => {
        return (
          <Box
            key={c.id}
            sx={{
              backgroundColor: c.blocked ? '#cccccc' : c.subject.color + '70',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: c.blocked
                ? `0 0 2px #bbbbbb inset`
                : c.teacher
                ? `0 0 2px ${c.subject.color} inset`
                : undefined,
              borderWidth: !c.teacher ? '2px' : undefined,
              borderStyle: !c.teacher ? 'solid' : undefined,
              borderColor: !c.teacher ? theme.palette.error.main : undefined,
            }}
          >
            {c.subject.shortForm}
          </Box>
        )
      })}
    </Box>
  )

  const columns: GridColDef[] = [
    { field: 'label', headerName: '', width: 200, sortable: false },

    ...[1, 2, 3, 4, 5].map(
      (n): GridColDef => ({
        field: n.toString(),
        headerName: date.day(n).format('YYYY-MM-DD'),
        renderHeader: () => (
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.2' }}>
            <span>
              <b>{date.day(n).format('dddd')}</b>
            </span>
            <br />
            <span>{date.day(n).format('DD.MM.YYYY')}</span>
          </div>
        ),
        width: 150,
        sortable: false,
        valueGetter: getCellValue,
        renderCell,
      }),
    ),
  ]

  const rows: GridRowsProp = labels.map((t) => ({
    id: t.id,
    label: t.title,
  }))

  return (
    <Box
      className={styles.wrapper}
      sx={{
        width: columns.reduce((p, c) => p + (c.width ?? 100), 0),
        maxWidth: '100%',
        height: '100%',
        overflowX: 'scroll',
      }}
    >
      <DataGrid
        style={{
          flexGrow: 1,
          border: 'none',
        }}
        rows={rows}
        columns={columns}
        disableColumnMenu={true}
        disableSelectionOnClick={true}
        onCellClick={(params) => {
          if (
            params.colDef.field !== 'label' &&
            (params.value ?? []).length > 0
          ) {
            setDrawer({
              open: true,
              params: params,
              lessons: lessons,
            })
          }
        }}
      />
    </Box>
  )
}

export default MultiCalendar
