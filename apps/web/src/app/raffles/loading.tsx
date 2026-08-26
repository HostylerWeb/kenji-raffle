export default function RafflesLoading() {
  return (
    <div>
      <div className="site-skeleton site-loading-title" />
      <div className="site-skeleton site-loading-bar" />
      <div className="site-raffle-grid site-raffle-grid--commerce">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="site-skeleton site-loading-card" />
        ))}
      </div>
    </div>
  );
}
