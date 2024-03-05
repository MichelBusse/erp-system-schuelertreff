import user from './user'

export type UserDocument = {
  id: number

  owner?: user

  fileName: string

  fileType: string

  visibleToUser: boolean

  visibleToEverybody: boolean

  mayDelete: boolean

  createdDate: string

  content?: string
}