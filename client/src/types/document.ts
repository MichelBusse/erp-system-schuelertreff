import user from './user'

type document = {
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

export default document
