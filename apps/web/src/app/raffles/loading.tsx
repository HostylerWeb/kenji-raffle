export default function RafflesLoading() {
  return (
    <div>
      <div className="site-skeleton" style={{ height: 36, width: 200, marginBottom: 24 }} />
      <div className="site-skeleton" style={{ height: 40, width: "100%", maxWidth: 480, marginBottom: 24 }} />
      <div className="site-raffle-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="site-skeleton" style={{ height: 320, borderRadius: "var(--site-radius)" }} />
        ))}
      </div>
    </div>
  );
}
