import { contract } from "./contract"

export enum LessonState {
  IDLE = 'idle',
  HELD = 'held',
  CANCELLED = 'cancelled',
}

export type lesson = {
  id: number,
  date: string,
  state: LessonState,
  teacher: number[],
  contract: contract
}
