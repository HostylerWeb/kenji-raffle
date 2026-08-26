export default function HomeLoading() {
  return (
    <>
      <div className="site-featured-hero">
        <div className="site-container">
          <div className="site-skeleton site-loading-title" />
          <div className="site-skeleton site-loading-bar" />
        </div>
        <div className="site-featured-hero__scroll">
          <div className="site-featured-hero__track">
            {[1, 2, 3].map((i) => (
              <div key={i} className="site-skeleton site-featured-hero__card--skeleton" />
            ))}
          </div>
        </div>
      </div>
      <div className="site-stats-band">
        <div className="site-container">
          <div className="site-skeleton site-loading-bar" />
        </div>
      </div>
    </>
  );
}
