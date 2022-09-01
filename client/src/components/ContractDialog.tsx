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
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useSnackbar } from 'notistack'
import React, { useState } from 'react'

import { snackbarOptions, snackbarOptionsError } from '../consts'
import { ContractState, contractWithTeacher } from '../types/contract'
import { ContractType } from '../types/enums'
import { ContractCreationForm, ContractFilterForm } from '../types/form'
import { leave } from '../types/user'
import { useAuth } from './AuthProvider'
import ContractCreation, { suggestion } from './contractDialog/ContractCreation'
import Filter from './contractDialog/Filter'
import ConfirmationDialog, {
  ConfirmationDialogProps,
  defaultConfirmationDialogProps,
} from './ConfirmationDialog'

dayjs.extend(customParseFormat)

export enum CustomerType {
  PRIVATE = 'privateCustomer',
  SCHOOL = 'school',
}

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
  initialContract?: contractWithTeacher
}

const ContractDialog: React.FC<Props> = ({
  open,
  setOpen,
  onSuccess = () => {},
  initialContract,
}) => {
  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const [activeStep, setActiveStep] = useState(0)
  const theme = useTheme()
  const [confirmationDialogProps, setConfirmationDialogProps] =
    useState<ConfirmationDialogProps>(defaultConfirmationDialogProps)

  // step 0
  const [loading0, setLoading0] = useState(false)
  const [form0, setForm0] = useState<ContractFilterForm>({
    school: null,
    classCustomers: [],
    privateCustomers: [],
    subject: null,
    interval: 1,
    startDate: dayjs().add(1, 'day'),
    endDate: null,
    customerType: CustomerType.PRIVATE,
    contractType: ContractType.STANDARD,
  })

  // step 1
  const [suggestions, setSuggestions] = useState<suggestion[]>([])
  const [leaves, setLeaves] = useState<Record<number, leave[]>>([])
  const [loading1, setLoading1] = useState(false)
  const [form1, setForm1] = useState<ContractCreationForm>({
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
    form0.startDate.isAfter(dayjs()) &&
    ((form0.customerType === CustomerType.PRIVATE &&
      form0.privateCustomers.length > 0) ||
      (form0.customerType === CustomerType.SCHOOL &&
        form0.school !== null &&
        form0.classCustomers.length > 0))
  )

  const handleSubmit0 = () => {
    setLoading0(true)

    API.get('users/leaves/intersecting', {
      params: {
        start: form0.startDate?.format('YYYY-MM-DD'),
        end: form0.endDate?.format('YYYY-MM-DD'),
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

        setLeaves(leavesByTeacher)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
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
        ignoreContracts: initialContract ? initialContract.id : undefined,
      },
    })
      .then((res) => {
        setSuggestions(res.data)
        setActiveStep(1)

        setForm1({
          startDate: form0.startDate,
          endDate: form0.endDate,
          startTime: null,
          endTime: null,
          minTime: null,
          maxTime: null,
          teacher: 'later',
          teacherConfirmation: false,
          dow: form0.startDate?.day() ?? 1,
          selsuggestion: '',
        })

        if (initialContract) {
          const initialStartDate = dayjs(
            initialContract.startDate,
            'YYYY-MM-DD',
          )
          const initialStartTime = dayjs(initialContract.startTime, 'HH:mm')
          const initialEndTime = dayjs(initialContract.endTime, 'HH:mm')

          const resSuggestions = res.data as suggestion[]

          resSuggestions.forEach((teacherSuggestion, teacherIndex) => {
            if (initialContract.teacher) {
              if (teacherSuggestion.teacherId === initialContract.teacher.id) {
                teacherSuggestion.suggestions.forEach(
                  (timeSuggestion, timeIndex) => {
                    if (
                      timeSuggestion.dow === initialStartDate.day() &&
                      !dayjs(timeSuggestion.start, 'HH:mm').isAfter(
                        initialStartTime,
                      ) &&
                      !dayjs(timeSuggestion.end, 'HH:mm').isBefore(
                        initialEndTime,
                      )
                    ) {
                      setForm1((form1) => ({
                        ...form1,
                        selsuggestion: teacherIndex + ',' + timeIndex,
                      }))
                    }
                  },
                )
              }
            } else {
              setForm1((form1) => ({
                ...form1,
                startTime: dayjs(initialContract.startTime, 'HH:mm'),
                endTime: initialEndTime,
              }))
            }
          })
        }
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
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
      endDate: form1.endDate?.format('YYYY-MM-DD'),
      startTime: form1.startTime?.format('HH:mm'),
      endTime: form1.endTime?.format('HH:mm'),
      state: form1.teacherConfirmation
        ? ContractState.PENDING
        : ContractState.ACCEPTED,
      contractType: form0.contractType,
      initialContractId: initialContract?.id,
    })
      .then(() => {
        onSuccess()

        setOpen(false)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
      .finally(() => setLoading1(false))
  }

  const deleteContract = () => {
    if (initialContract) {
      setConfirmationDialogProps({
        open: true,
        setProps: setConfirmationDialogProps,
        title: 'Einsatz wirklich löschen?',
        text: 'Möchtest du den Einsatz wirklich löschen?',
        action: () => {
          API.delete('contracts/' + initialContract?.id).then(() => {
            enqueueSnackbar('Einsatz gelöscht', snackbarOptions)
            onSuccess()
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
        <Filter
          form={form0}
          setForm={setForm0}
          initialContract={initialContract}
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
        </>
      ),
    },
    {
      label: 'Termin auswählen',
      content: (
        <ContractCreation
          form={form1}
          setForm={setForm1}
          suggestions={suggestions}
          leaves={leaves}
          subject={form0.subject}
          minStartDate={form0.startDate}
          maxEndDate={form0.endDate}
          initialContract={initialContract}
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
        <DialogActions>
          {steps[activeStep].actions}
          {initialContract && (
            <Button onClick={deleteContract} color="error">
              Löschen
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <ConfirmationDialog confirmationDialogProps={confirmationDialogProps} />
    </>
  )
}

export default ContractDialog
