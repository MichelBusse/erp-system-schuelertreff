import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { nanoid } from 'nanoid'
import logo from './logo.svg'
import './App.scss'

type Message = {
  data: string
  id: string
}

const socket = io(import.meta.env.VITE_API_URL, { transports: ['websocket'] })

const App: React.FC = () => {
  const [count, setCount] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [msgInput, setMsgInput] = useState('')

  const handleSubmitMessage = () => {
    socket.emit('message', { data: msgInput, id: nanoid() })
    setMsgInput('')
  }

  useEffect(() => {
    socket.on("connect_error", err => console.error(`connect_error due to ${err.message}`))

    socket.on('message', (msg: Message) => setMessages(m => [...m, msg]))
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <p>
          <button type="button" onClick={() => setCount((count) => count + 1)}>
            count is: {count}
          </button>
        </p>
        <p>API url: {import.meta.env.VITE_API_URL}</p>

        <ul>
          {messages.map(msg => <li key={msg.id}>{msg.data}</li>)}
        </ul>

        <input
          type="text"
          value={msgInput}
          onChange={e => setMsgInput(e.target.value)}
          onKeyPress={e => (e.key == 'Enter') ? handleSubmitMessage() : ''}
        />

        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {' | '}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  )
}

export default App
