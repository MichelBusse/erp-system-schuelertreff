import axios, { AxiosInstance } from 'axios'
import jwtDecode from 'jwt-decode'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useInterval from 'react-useinterval'

import { NavigateState } from '../App'

const KEY = 'token'
const MINUTE = 60000

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
  API: AxiosInstance
}

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

  const [token, setToken] = useState(localStorage.getItem(KEY) ?? '')

  // localstorage value will be updated whenever token changes
  useEffect(() => {
    localStorage.setItem(KEY, token)
  }, [token])

  // axios instance
  const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: token !== '' ? `Bearer ${token}` : '',
    },
  })

  API.interceptors.response.use(undefined, (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // 401 unauthorized - token seems to be invalid!
      handleLogout()
    }

    return Promise.reject(error)
  })

  // methods

  const handleLogin = async (email: string, password: string) => {
    // will throw an error if the request fails
    const response = await API.post('/auth/login', {
      username: email,
      password: password,
    })

    if (response.data.access_token) {
      setToken(response.data.access_token)

      const origin = (location.state as NavigateState)?.from?.pathname || '/'
      navigate(origin)
    }
  }

  const handleLogout = () => setToken('')

  const isAuthed = () => {
    return token !== '' && new Date().getTime() < decodeToken().exp * 1000
  }

  const decodeToken = () => jwtDecode<JwtType>(token)

  const refreshToken = () => {
    if (isAuthed()) {
      API.get('/auth/refresh')
        .then((res) => {
          setToken(res.data.access_token)
        })
        .catch((err) => {
          console.error('error while refreshing token:', err)
        })
    }
  }

  // if logged in, refresh token every minute to keep it active
  useInterval(refreshToken, MINUTE)

  // if token is already older than 1 minute, refresh immediately (will trigger logout if token is invalid)
  useEffect(() => {
    if (new Date().getTime() - decodeToken().iat * 1000 > MINUTE) {
      refreshToken()
    }
  }, [])

  // context provider

  const value = {
    token,
    handleLogin,
    handleLogout,
    isAuthed,
    decodeToken,
    API,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
