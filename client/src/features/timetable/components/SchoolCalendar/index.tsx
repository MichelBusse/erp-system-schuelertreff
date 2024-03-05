import { CircularProgress } from '@mui/material'
import { Box } from '@mui/system'
import dayjs, { Dayjs } from 'dayjs'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { classCustomer } from '../../../../core/types/user'
import { DrawerParameters } from '../../pages/Timetable'
import { contract } from '../../../../core/types/contract'
import { useAuth } from '../../../auth/components/AuthProvider'
import { lesson } from '../../../../core/types/lesson'
import { snackbarOptionsError } from '../../../../core/res/consts'
import MultiCalendar from '../MultiCalendar'


type Props = {
  date: Dayjs
  setDrawer: (params: DrawerParameters) => void
  refresh?: number
}

const SchoolCalendar: React.FC<Props> = ({ date, setDrawer, refresh }) => {
  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const [contracts, setContracts] = useState<Record<number, contract[]>>({})
  const [lessons, setLessons] = useState<lesson[]>([])
  const [classes, setClasses] = useState<{ id: number; title: string }[]>([])

  const [loading, setLoading] = useState(true)
  const [renderLoading, setRenderLoading] = useState(0)

  const { id } = useParams()
  const requestedId = id ?? 'me'
  console.log(requestedId)
  console.log(id)

  useEffect(() => {
    API.get('users/classCustomer/' + requestedId).then((res) =>
      setClasses(
        res.data
          .map((classCustomer: classCustomer) => ({
            id: classCustomer.id,
            title: classCustomer.className,
          }))
          .concat({ id: -1, title: 'Allgemein' }),
      ),
    )
  }, [refresh])

  useEffect(() => {
    const ongoingRequest = new AbortController()

    setRenderLoading((r) => r + 1)
    setLoading(true)
    setContracts({})

    API.get('lessons/week/mySchool', {
      signal: ongoingRequest.signal,
      params: {
        of: date.format('YYYY-MM-DD'),
      },
    })
      .then((res) => {
        const contractsByClass: Record<number, contract[]> = {}
        console.log(res.data.contracts)
        res.data.contracts
          .sort((a: contract, b: contract) => {
            return dayjs(a.startTime, 'HH:mm').diff(dayjs(b.startTime, 'HH:mm'))
          })
          .map((c: contract) => {
            c.customers.map((customer) => {
              if (customer.role === 'classCustomer') {
                if (customer.defaultClassCustomer === true) {
                  contractsByClass[-1] = (contractsByClass[-1] ?? []).concat(c)
                } else {
                  contractsByClass[customer.id] = (
                    contractsByClass[customer.id] ?? []
                  ).concat(c)
                }
              }
            })
          })

        setContracts(contractsByClass)
        setLessons(res.data.lessons)
        setLoading(false)
      })
      .catch((err) => {
        if (err?.code !== 'ERR_CANCELED') {
          console.error(err)
          enqueueSnackbar('Ein Fehler ist aufgetreten', snackbarOptionsError)
        }
      })

    // abort request
    return () => ongoingRequest.abort()
  }, [date, refresh])

  return (
    <>
      <Box
        sx={{
          height: '100%',
        }}
      >
        <MultiCalendar
          date={date}
          setDrawer={setDrawer}
          contracts={contracts}
          lessons={lessons}
          labels={classes}
        />

        <CircularProgress
          key={renderLoading}
          size={26}
          sx={{
            pointerEvents: 'none',
            position: 'absolute',
            top: 8,
            left: 8,
            opacity: loading ? 1 : 0,
            transition: 'opacity .25s ease',
          }}
        />
      </Box>
    </>
  )
}

export default SchoolCalendar
