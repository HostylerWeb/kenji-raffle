export default function HomeLoading() {
  return (
    <>
      <div className="site-skeleton" style={{ height: 320, borderRadius: "var(--site-radius-lg)", marginBottom: 40 }} />
      <div className="site-skeleton" style={{ height: 56, marginBottom: 40 }} />
      <div className="site-skeleton" style={{ height: 28, width: 180, marginBottom: 20 }} />
      <div className="site-raffle-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="site-skeleton" style={{ height: 320, borderRadius: "var(--site-radius)" }} />
        ))}
      </div>
    </>
  );
}
