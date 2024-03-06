import axios from 'axios'
import jwtDecode from 'jwt-decode'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useInterval from 'react-useinterval'

import UserRole from '../../../../core/enums/UserRole.enum'
import NavigationState from '../../../../core/types/NavigationState'
import AuthContextValue from '../../../../core/types/AuthContextValue'
import Jwt from '../../../../core/types/Jwt'

const KEY = 'token'
const MINUTE = 60000

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

      const origin = (location.state as NavigationState)?.from?.pathname || '/'
      navigate(origin)
    }
  }

  const handleLogout = () => setToken('')

  const isAuthed = () => token !== ''

  const decodeToken = () => jwtDecode<Jwt>(token)

  const refreshToken = () => {
    API.get('/auth/refresh')
      .then((res) => {
        setToken(res.data.access_token)
      })
      .catch((err) => {
        console.error('error while refreshing token:', err)

        if (axios.isAxiosError(err) && err.response?.status === 500)
          handleLogout()
      })
  }

  const hasRole = (role: UserRole) => isAuthed() && decodeToken().role === role

  // if logged in, refresh token every minute to keep it active
  useInterval(() => {
    if (isAuthed()) refreshToken()
  }, MINUTE)

  // if token is already older than 1 minute, refresh immediately (will trigger logout if token is invalid)
  useEffect(() => {
    if (isAuthed() && new Date().getTime() - decodeToken().iat * 1e3 > MINUTE) {
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
    hasRole,
    API,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
