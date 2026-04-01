function LoadingSkeleton({ type = 'card' }) {
  if (type === 'detail') {
    return (
      <section className="skeleton-detail" aria-hidden="true">
        <div className="skeleton-title shimmer" />
        <div className="skeleton-grid">
          <div className="skeleton-block shimmer" />
          <div className="skeleton-block shimmer" />
          <div className="skeleton-block shimmer" />
          <div className="skeleton-block shimmer" />
        </div>
      </section>
    )
  }

  return (
    <div className="skeleton-list" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div className="skeleton-card shimmer" key={index} />
      ))}
    </div>
  )
}

export default LoadingSkeleton
