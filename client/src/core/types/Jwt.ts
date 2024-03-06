type Jwt = {
  exp: number
  iat: number
  sub: number
  username: string
  role: string
  state?: string
}

export default Jwt;