import Leave from "./Leave"

type TimeSuggestion = {
  teacherId: number
  teacherName: string
  suggestions: {
    dow: number
    start: string
    end: string
    overlap: number[]
  }[]
  leave: Leave[]
}

export default TimeSuggestion;