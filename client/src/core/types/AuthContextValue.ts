import { AxiosInstance } from "axios"
import Jwt from "./Jwt"
import UserRole from "../enums/UserRole.enum"

type AuthContextValue = {
  token: string
  handleLogin: (email: string, password: string) => Promise<void>
  handleLogout: () => void
  isAuthed: () => boolean
  decodeToken: () => Jwt
  hasRole: (role: UserRole) => boolean
  API: AxiosInstance
}

export default AuthContextValue;