import Error from '../Error'

export default function NotFoundError() {
  return <Error code="404" message="Seite nicht gefunden" />
}
