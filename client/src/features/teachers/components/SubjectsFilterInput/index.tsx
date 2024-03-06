import { useEffect, useState } from 'react'
import { useAuth } from '../../../auth/components/AuthProvider'
import Subject from '../../../../core/types/Subject'
import { GridFilterInputValueProps } from '@mui/x-data-grid'
import { Autocomplete, Box, TextField } from '@mui/material'

//definition of subject filter input
export default function SubjectsFilterInput({
  item,
  applyValue,
}: GridFilterInputValueProps) {
  const { API } = useAuth()

  const [subjects, setSubjects] = useState<Subject[]>([])

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
