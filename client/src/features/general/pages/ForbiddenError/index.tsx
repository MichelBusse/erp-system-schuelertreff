import Error from '../Error'

export default function ForbiddenError() {
  return <Error code="403" message="Fehlende Berechtigung" />
}
