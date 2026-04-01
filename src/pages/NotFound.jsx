import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="not-found fade-in">
      <h1>Page not found</h1>
      <p>The song route you requested does not exist.</p>
      <Link to="/">Go back home</Link>
    </section>
  )
}

export default NotFound
