import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'

import { snackbarOptionsError } from '../consts'
import { contract, ContractState } from '../types/contract'
import { ContractCreationForm } from '../types/form'
import { leave } from '../types/user'
import { useAuth } from './AuthProvider'
import ContractCreation, { suggestion } from './contractDialog/ContractCreation'

dayjs.locale('de')

type Data = {
  contract: contract
  suggestions: suggestion[]
  leaves: Record<number, leave[]>
  minStartDate: Dayjs
  maxEndDate: Dayjs
}

type Props = {
  onSuccess?: () => void
  startDate: string
  endDate: string
  teacher: number
}

const formatTime = (time: string) => dayjs(time, 'HH:mm').format('HH:mm')

const LeaveDialogSubstitute: React.FC<Props> = ({
  startDate,
  endDate,
  teacher,
}) => {
  const [contracts, setContracts] = useState<contract[]>([])
  const [openAccordion, setOpenAccordion] = useState(0)
  const [refresh, setRefresh] = useState(0)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [render, setRender] = useState(0)
  const [data, setData] = useState<Data>()
  const [form, setForm] = useState<ContractCreationForm>({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    minTime: null,
    maxTime: null,
    teacher: '',
    teacherConfirmation: true,
    dow: 1,
    selsuggestion: '',
  })

  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    API.get('contracts/findBlocked', {
      params: {
        startDate,
        endDate,
        teacher,
      },
    }).then((res) => setContracts(res.data))
  }, [refresh])

  const validForm = !!(
    form.teacher !== '' &&
    form.startDate !== null &&
    form.startTime !== null &&
    form.endTime !== null
  )

  const handleAccordion = (id: number) =>
    setOpenAccordion((open) => (open === id ? 0 : id))

  const openDialog = async (contract: contract) => {
    const lessonsSorted = contract.lessons
      .map((l) => dayjs(l.date))
      .slice()
      .sort((a, b) => a.diff(b))

    // monday of week of first affected lesson
    const minStartDate = lessonsSorted.at(0)?.day(1)
    // friday of week of last affected lesson
    const maxEndDate = lessonsSorted.at(-1)?.day(5)

    if (
      typeof minStartDate === 'undefined' ||
      typeof maxEndDate === 'undefined'
    )
      return console.log('impossible error')

    // get leaves
    const leaves = await API.get('users/leaves/intersecting', {
      params: {
        start: minStartDate.format('YYYY-MM-DD'),
        end: maxEndDate.format('YYYY-MM-DD'),
      },
    })
      .then((res) => {
        const leavesByTeacher: Record<number, leave[]> = {}

        ;(res.data as leave[]).map((l) => {
          leavesByTeacher[l.user.id] = [
            ...(leavesByTeacher[l.user.id] ?? []),
            l,
          ]
        })

        return leavesByTeacher
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })

    if (typeof leaves === 'undefined') return

    // get suggestions
    const suggestions: suggestion[] = await API.get('contracts/suggest', {
      params: {
        customers: contract.customers.map((c) => c.id).join(','),
        subjectId: contract.subject.id,
        interval: contract.interval,
        startDate: minStartDate.format('YYYY-MM-DD'),
        endDate: maxEndDate.format('YYYY-MM-DD'),
        originalTeacher: contract.teacher.id,
        ignoreContracts: contracts.map((c) => c.id).join(','),
      },
    })
      .then((res) => res.data)
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })

    if (typeof suggestions === 'undefined') return

    setForm({
      startDate: minStartDate,
      endDate: maxEndDate,
      startTime: null,
      endTime: null,
      minTime: null,
      maxTime: null,
      teacher: '',
      teacherConfirmation: true,
      dow: 1,
      selsuggestion: '',
    })

    setData({
      contract,
      suggestions,
      leaves,
      minStartDate,
      maxEndDate,
    })
    setRender((r) => r + 1)
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!data) return

    setLoading(true)

    API.post('contracts', {
      customers: data.contract.customers.map((c) => c.id),
      subject: data.contract.subject.id,
      interval: data.contract.interval,
      teacher: form.teacher,
      startDate: form.startDate?.format('YYYY-MM-DD'),
      endDate: form.endDate?.format('YYYY-MM-DD'),
      startTime: form.startTime?.format('HH:mm'),
      endTime: form.endTime?.format('HH:mm'),
      state: form.teacherConfirmation
        ? ContractState.PENDING
        : ContractState.ACCEPTED,
      parentContract: data.contract.id,
    })
      .then(() => {
        setRefresh((r) => r + 1)
        setDialogOpen(false)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
      .finally(() => setLoading(false))
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Typography>
        {contracts.length === 0
          ? 'Keine betroffenen Unterrichtsstunden'
          : 'Vertretung:'}
      </Typography>
      {contracts.map((c) => {
        const dow = dayjs(c.startDate).format('dddd')

        return (
          <Accordion
            key={c.id}
            disableGutters
            expanded={openAccordion === c.id}
            onChange={() => handleAccordion(c.id)}
            sx={{
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {dow + ` ${formatTime(c.startTime)} - ${formatTime(c.endTime)}`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {c.childContracts.length === 0 && (
                <Typography>noch nicht vorhanden</Typography>
              )}
              {c.childContracts.map((child) => (
                <Typography key={child.id}>{child.id}</Typography>
              ))}
            </AccordionDetails>
            <AccordionActions>
              <Button onClick={() => openDialog(c)}>hinzufügen</Button>
            </AccordionActions>
          </Accordion>
        )
      })}

      <Dialog open={dialogOpen}>
        <DialogTitle>Vertretung hinzufügen</DialogTitle>
        <DialogContent
          sx={{
            width: 500,
            '& .MuiStepConnector-root': {
              maxWidth: '100px',
            },
          }}
        >
          <Box sx={{ overflow: 'auto', padding: 0.5, height: '345px' }}>
            {!!data && (
              <ContractCreation
                key={render}
                form={form}
                setForm={setForm}
                suggestions={data.suggestions}
                leaves={data.leaves}
                subject={data.contract.subject}
                minStartDate={data.minStartDate}
                maxEndDate={data.maxEndDate}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <LoadingButton
            variant="contained"
            onClick={handleSubmit}
            loading={loading}
            disabled={!validForm}
          >
            Hinzufügen
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LeaveDialogSubstitute
