"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { playerFetch } from "@/lib/player-api";

export default function ContactPage() {
  const [fromEmail, setFromEmail] = useState("");
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await playerFetch("/v1/contact", {
        method: "POST",
        body: JSON.stringify({ from_email: fromEmail, name, body }),
      });
      setMessage("Message sent. We will reply by email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Contact us</h1>
      <p><Link href="/">Home</Link></p>
      <form className="form card" onSubmit={onSubmit}>
        <label>Your email<input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} required /></label>
        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Message<textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={5} /></label>
        {error && <p className="error">{error}</p>}
        {message && <p style={{ color: "#15803d" }}>{message}</p>}
        <button type="submit" className="btn">Send</button>
      </form>
    </main>
  );
}
