import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Layout from './components/Layout'
import Pages from './pages/_pages'
import './globals.scss'

const theme = createTheme()

const Login = () => (
  <>
    <h2>Login</h2>
    <Link to="/">Home</Link>
  </>
)

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="" element={<Pages.Home />} />
            <Route path="timetable" element={<Pages.Timetable />} />
            <Route path="customers" element={<Pages.Customers />} />
            <Route path="teachers" element={<Pages.Teachers />} />
            <Route path="subjects" element={<Pages.Subjects />} />
            <Route path="temporaryDrawer" element={<Pages.TemporaryDrawer />} />
          </Route>

          <Route path="/login" element={<Login />} />

          <Route path="*" element={<Pages.NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
