import User from './User'

type UserDocument = {
  id: number

  owner?: User

  fileName: string

  fileType: string

  visibleToUser: boolean

  visibleToEverybody: boolean

  mayDelete: boolean

  createdDate: string

  content?: string
}

export default UserDocument;