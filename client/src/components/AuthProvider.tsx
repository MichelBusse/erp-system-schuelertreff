import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

type AuthContextValue = {
  token: string
  handleLogin: Function
  handleLogout: Function
  isAuthed: Function
}

const AuthContext = React.createContext<AuthContextValue>({
  token: '',
  handleLogin: () => {},
  handleLogout: () => {},
  isAuthed: () => false,
})

const localStorageKey = 'token'

const AuthProvider: React.FC = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const [token, setToken] = useState(
    localStorage.getItem(localStorageKey) ?? '',
  )

  useEffect(() => {
    localStorage.setItem(localStorageKey, token)
  }, [token])

  const handleLogin = async (email: string, password: string) => {
    //TODO: POST /auth/login

    setToken(email)

    const origin = (location.state as any)?.from?.pathname || '/'
    navigate(origin)
  }

  const handleLogout = () => {
    setToken('')
  }

  const isAuthed = () => {
    return token !== ''
  }

  const value = {
    token,
    handleLogin,
    handleLogout,
    isAuthed,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return React.useContext(AuthContext)
}

export default AuthProvider
