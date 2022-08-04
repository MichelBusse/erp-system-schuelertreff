import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { contract } from '../types/contract'
import { useAuth } from './AuthProvider'

dayjs.locale('de')

type Props = {
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

  const { API } = useAuth()

  useEffect(() => {
    API.get('contracts/findBlocked', {
      params: {
        startDate,
        endDate,
        teacher,
      },
    }).then((res) => setContracts(res.data))
  }, [])

  const handleAccordion = (id: number) =>
    setOpenAccordion((open) => (open === id ? 0 : id))

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
              <Button>hinzufügen</Button>
            </AccordionActions>
          </Accordion>
        )
      })}
    </Box>
  )
}

export default LeaveDialogSubstitute
