"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { playerFetch } from "@/lib/player-api";

export function ContactForm({ supportEmail }: { supportEmail?: string | null }) {
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
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    }
  }

  return (
    <div className="site-contact-form">
      {supportEmail && (
        <p className="site-muted site-contact-form__note">
          You can also email us directly at{" "}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
        </p>
      )}
      <form className="site-form site-card site-card--v2" onSubmit={onSubmit}>
        <label>
          Your email
          <input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} required />
        </label>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Message
          <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={5} />
        </label>
        {error && <p className="site-error" role="alert">{error}</p>}
        {message && <p className="site-success-text">{message}</p>}
        <button type="submit" className="site-btn site-btn--primary site-btn--block">
          Send message
        </button>
      </form>
    </div>
  );
}
