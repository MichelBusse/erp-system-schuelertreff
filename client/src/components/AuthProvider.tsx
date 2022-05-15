import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import jwtDecode from 'jwt-decode'
import axios from 'axios'

const localStorageKey = 'token'

export type JwtType = {
  exp: number
  iat: number
  sub: number
  username: string
  role: string
}

export type AuthContextValue = {
  token: string
  handleLogin: (email: string, password: string) => Promise<void>
  handleLogout: () => void
  isAuthed: () => boolean
  decodeToken: () => JwtType
}

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

const AuthContext = React.createContext({} as AuthContextValue)

/**
 * Hook that provides access to the {@link AuthContext}'s value
 */
export const useAuth = () => {
  return React.useContext(AuthContext)
}

/**
 * Context Provider for {@link AuthContext}
 */
const AuthProvider: React.FC = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const [token, setToken] = useState(
    localStorage.getItem(localStorageKey) ?? '',
  )

  useEffect(() => {
    localStorage.setItem(localStorageKey, token)
  }, [token])

  // methods

  const handleLogin = async (email: string, password: string) => {
    // will throw an error if the request fails
    const response = await API.post('/auth/login', {
      username: email,
      password: password,
    })

    if (response.data.access_token) {
      setToken(response.data.access_token)

      const origin = (location.state as any)?.from?.pathname || '/'
      navigate(origin)
    }
  }

  const handleLogout = () => setToken('')

  const isAuthed = () => {
    return token !== '' && new Date().getTime() >= decodeToken().exp * 1000
  }

  const decodeToken = () => jwtDecode<JwtType>(token)

  // context provider

  const value = {
    token,
    handleLogin,
    handleLogout,
    isAuthed,
    decodeToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
