import 'dayjs/locale/de'

import { LoadingButton } from '@mui/lab'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import axios from 'axios'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useSnackbar } from 'notistack'
import React, { useState } from 'react'
import { useAuth } from '../../../../auth/components/AuthProvider'
import ConfirmationDialog from '../../../../general/components/ConfirmationDialog'
import {
  SNACKBAR_OPTIONS,
  SNACKBAR_OPTIONS_ERROR,
} from '../../../../../core/res/Constants'
import CreationPage from '../ContractCreationPage'
import FilterPage from '../ContractFilterPage'
import ContractFilterFormState from '../../../../../core/types/Form/ContractFilterFormState'
import { Contract } from '../../../../../core/types/Contract'
import ContractCreationFormState from '../../../../../core/types/Form/ContractCreationFormState'
import TimeSuggestion from '../../../../../core/types/TimeSuggestion'
import Leave from '../../../../../core/types/Leave'
import ContractState from '../../../../../core/enums/ContractState.enum'
import ConfirmationDialogData from '../../../../../core/types/ConfirmationDialogData'
import { DEFAULT_CONFIRMATION_DIALOG_DATA } from '../../../../../core/res/Defaults'
import ContractType from '../../../../../core/enums/ContractType.enum'
import CustomerType from '../../../../../core/enums/CustomerType.enum'

dayjs.extend(customParseFormat)

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
  initialContract?: Contract
  initialForm0Props?: Partial<ContractFilterFormState>
}

export default function ContractCreateDialog({
  open,
  setOpen,
  onSuccess = () => {},
  initialContract,
  initialForm0Props,
}: Props) {
  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const [activeStep, setActiveStep] = useState(0)
  const theme = useTheme()
  const [confirmationDialogData, setConfirmationDialogData] =
    useState<ConfirmationDialogData>(DEFAULT_CONFIRMATION_DIALOG_DATA)

  const [alreadySubmitted, setAlreadySubmitted] = useState<boolean>(false)

  // step 0
  const [loading0, setLoading0] = useState(false)
  const [form0, setForm0] = useState<ContractFilterFormState>({
    school: null,
    classCustomers: [],
    privateCustomers: [],
    subject: null,
    interval: 1,
    minStartDate: dayjs().add(1, 'day'),
    startDate: dayjs().add(1, 'day'),
    endDate: null,
    customerType: CustomerType.PRIVATE,
    contractType: ContractType.STANDARD,
    ...initialForm0Props,
    startTime: null,
    endTime: null,
    dow: undefined,
  })

  // step 1
  const [suggestions, setSuggestions] = useState<TimeSuggestion[]>([])
  const [leaves, setLeaves] = useState<Record<number, Leave[]>>([])
  const [loading1, setLoading1] = useState(false)
  const [form1, setForm1] = useState<ContractCreationFormState>({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    minTime: null,
    maxTime: null,
    teacher: 'later',
    teacherConfirmation: false,
    dow: 1,
    selsuggestion: '',
  })

  const validForm0 = !!(
    form0.subject &&
    form0.interval &&
    form0.startDate &&
    ((form0.customerType === CustomerType.PRIVATE &&
      form0.privateCustomers.length > 0) ||
      (form0.customerType === CustomerType.SCHOOL && form0.school !== null))
  )

  const handleSubmit0 = () => {
    setLoading0(true)
    setAlreadySubmitted(true)

    API.get('users/leaves/intersecting', {
      params: {
        start: form0.startDate?.format('YYYY-MM-DD'),
        end: form0.endDate?.format('YYYY-MM-DD'),
      },
    })
      .then((res) => {
        const leavesByTeacher: Record<number, Leave[]> = {}

        ;(res.data as Leave[]).map((l) => {
          leavesByTeacher[l.user.id] = [
            ...(leavesByTeacher[l.user.id] ?? []),
            l,
          ]
        })

        setLeaves(leavesByTeacher)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
      })

    API.get('contracts/suggest', {
      params: {
        customers: (form0.customerType === CustomerType.SCHOOL
          ? form0.classCustomers
          : form0.privateCustomers
        )
          .map((c) => c.id)
          .join(','),
        subjectId: form0.subject?.id,
        interval: form0.interval,
        startDate: form0.startDate?.format('YYYY-MM-DD'),
        endDate: form0.endDate?.format('YYYY-MM-DD'),
        startTime: form0.startTime?.format('HH:mm'),
        dow: form0.dow,
        endTime: form0.endTime?.format('HH:mm'),
        ignoreContracts: initialContract ? initialContract.id : undefined,
      },
    })
      .then((res) => {
        setForm1({
          startDate: form0.startDate,
          endDate: form0.endDate,
          startTime: form0.startTime,
          endTime: form0.endTime,
          minTime: null,
          maxTime: null,
          teacher: 'later',
          teacherConfirmation: false,
          dow: form0.startDate?.day() ?? 1,
          selsuggestion: '',
        })

        setSuggestions(res.data)

        setActiveStep(1)

        if (initialContract) {
          const initialStartDate = dayjs(
            initialContract.startDate,
            'YYYY-MM-DD',
          )
          const initialStartTime = dayjs(initialContract.startTime, 'HH:mm')
          const initialEndTime = dayjs(initialContract.endTime, 'HH:mm')

          const resSuggestions = res.data as TimeSuggestion[]

          resSuggestions.forEach((teacherSuggestion, teacherIndex) => {
            if (
              (initialContract.teacher &&
                teacherSuggestion.teacherId === initialContract.teacher.id) ||
              (!initialContract.teacher && teacherSuggestion.teacherId === -1)
            ) {
              teacherSuggestion.suggestions.forEach(
                (timeSuggestion, timeIndex) => {
                  if (
                    timeSuggestion.dow === initialStartDate.day() &&
                    !dayjs(timeSuggestion.start, 'HH:mm').isAfter(
                      initialStartTime,
                    ) &&
                    (!timeSuggestion.end ||
                      !dayjs(timeSuggestion.end, 'HH:mm').isBefore(
                        initialEndTime,
                      ))
                  ) {
                    setForm1((form1) => ({
                      ...form1,
                      selsuggestion: teacherIndex + ',' + timeIndex,
                    }))
                  }
                },
              )
            }
          })
        }
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
      })
      .finally(() => setLoading0(false))
  }

  const validForm1 = !!(
    form1.teacher !== '' &&
    form1.startDate !== null &&
    form1.startTime !== null &&
    form1.endTime !== null
  )

  const handleSubmit1 = () => {
    setLoading1(true)

    API.post('contracts', {
      customers: (form0.customerType === CustomerType.SCHOOL
        ? form0.classCustomers
        : form0.privateCustomers
      ).map((c) => c.id),
      subject: form0.subject?.id,
      interval: form0.interval,
      teacher: form1.teacher,
      startDate: form1.startDate?.format('YYYY-MM-DD'),
      endDate: form1.endDate?.format('YYYY-MM-DD') ?? null,
      startTime: form1.startTime?.format('HH:mm'),
      endTime: form1.endTime?.format('HH:mm'),
      state: form1.teacherConfirmation
        ? ContractState.PENDING
        : ContractState.ACCEPTED,
      contractType: form0.contractType,
      initialContractId: initialContract?.id,
      schoolId: form0.school?.id ?? undefined,
    })
      .then(() => {
        onSuccess()

        setOpen(false)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
      })
      .finally(() => setLoading1(false))
  }

  const deleteContract = () => {
    if (initialContract) {
      setConfirmationDialogData({
        open: true,
        setProps: setConfirmationDialogData,
        title: 'Einsatz wirklich löschen?',
        text: 'Es werden auch alle gehaltenen Stunden gelöscht und dieser Vorgang kann nicht mehr rückgängig gemacht werden.',
        action: () => {
          API.delete('contracts/' + initialContract?.id)
            .then(() => {
              enqueueSnackbar('Einsatz gelöscht', SNACKBAR_OPTIONS)
              onSuccess()
            })
            .catch((error) => {
              if (axios.isAxiosError(error) && error.response?.status === 400) {
                enqueueSnackbar(
                  (error.response.data as { message: string }).message,
                  SNACKBAR_OPTIONS_ERROR,
                )
                onSuccess()
              } else {
                console.error(error)
                enqueueSnackbar(
                  'Ein Fehler ist aufgetreten.',
                  SNACKBAR_OPTIONS_ERROR,
                )
              }
            })
        },
      })
    }
  }

  const steps: {
    label: string
    content: React.ReactNode
    actions: React.ReactNode
  }[] = [
    {
      label: 'Filterkonditionen',
      content: (
        <FilterPage
          form={form0}
          setForm={setForm0}
          initialContract={initialContract}
          alreadySubmitted={alreadySubmitted}
        />
      ),
      actions: (
        <>
          <Button onClick={() => setOpen(false)}>Abbrechen</Button>
          <LoadingButton
            variant="contained"
            onClick={handleSubmit0}
            loading={loading0}
            disabled={!validForm0}
          >
            Weiter
          </LoadingButton>
          {initialContract &&
            (!initialContract.endDate ||
              dayjs(initialContract.endDate).isAfter(dayjs())) && (
              <Button onClick={deleteContract} color="error">
                Löschen
              </Button>
            )}
        </>
      ),
    },
    {
      label: 'Termin auswählen',
      content: (
        <CreationPage
          form={form1}
          setForm={setForm1}
          suggestions={suggestions}
          leaves={leaves}
          subject={form0.subject}
          minStartDate={form0.startDate}
          maxEndDate={form0.endDate}
          initialStartTime={form0.startTime}
          initialEndTime={form0.endTime}
        />
      ),
      actions: (
        <>
          <Button onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button onClick={() => setActiveStep(0)}>Zurück</Button>
          <LoadingButton
            variant="contained"
            onClick={handleSubmit1}
            loading={loading1}
            disabled={!validForm1}
          >
            {initialContract ? 'Speichern' : 'Hinzufügen'}
          </LoadingButton>
        </>
      ),
    },
  ]

  return (
    <>
      <Dialog open={open}>
        <DialogTitle>
          Einsatz {initialContract ? 'bearbeiten' : 'hinzufügen'}
        </DialogTitle>
        <DialogContent
          sx={{
            '& .MuiStepConnector-root': {
              maxWidth: '100px',
            },
            [theme.breakpoints.down('sm')]: {
              width: '82vw',
            },
          }}
        >
          <Stepper activeStep={activeStep}>
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>
                  <Box
                    sx={{
                      [theme.breakpoints.down('sm')]: {
                        display: 'none',
                      },
                    }}
                  >
                    {step.label}
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ overflow: 'auto', padding: 0.5, height: '345px' }}>
            {steps[activeStep].content}
          </Box>
        </DialogContent>
        <DialogActions>{steps[activeStep].actions}</DialogActions>
      </Dialog>
      <ConfirmationDialog confirmationDialogData={confirmationDialogData} />
    </>
  )
}
