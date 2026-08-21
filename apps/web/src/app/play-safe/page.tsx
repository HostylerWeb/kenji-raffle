import Link from "next/link";

export default function PlaySafePage() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Play Safe</h1>
      <p>
        Play Safe lets you pause raffle purchases on your account for 7 days.
        During this time you cannot buy tickets.
      </p>
      <p>
        To activate Play Safe, log in and visit your{" "}
        <Link href="/account/play-safe">account Play Safe page</Link>.
      </p>
      <p className="muted">
        If you need help with problem gambling, contact support or use Play Safe
        from your account settings.
      </p>
    </main>
  );
}
