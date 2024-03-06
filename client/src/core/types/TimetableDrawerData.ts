import { GridCellParams } from "@mui/x-data-grid"
import Lesson from "./Lesson"

type TimetableDrawerData = {
  open: boolean
  params: GridCellParams | null
  lessons: Lesson[]
}

export default TimetableDrawerData;