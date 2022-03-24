import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  return (
    <>
      <h2>Index</h2>
      <Link to="/login">Login</Link>
    </>
  )
}

export default Home
