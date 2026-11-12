import { useState } from 'react';
import { CONTACT, PROFILE } from '../../data/portfolio';
import { Check, Copy, External, GitHub, LinkedIn, Mail, Phone, Pin } from '../icons';

export function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${CONTACT.email}`;
    }
  };

  return (
    <>
      <p className="eyebrow">Get in touch</p>
      <h3 className="display">Let's connect.</h3>
      <p className="lead">
        From {PROFILE.location}, connected to the world. The fastest way to reach me is email or LinkedIn.
      </p>

      <div className="contact-grid">
        <div className="contact-card wide">
          <span className="contact-ic">
            <Mail />
          </span>
          <div>
            <small>Email</small>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </div>
          <button className="icon-btn" onClick={copy} aria-label="Copy email address">
            {copied ? <Check /> : <Copy />}
          </button>
        </div>

        <a className="contact-card" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
          <span className="contact-ic">
            <LinkedIn />
          </span>
          <div>
            <small>LinkedIn</small>
            <b>{CONTACT.linkedinLabel}</b>
          </div>
          <External width={15} height={15} className="contact-go" />
        </a>

        <a className="contact-card" href={CONTACT.github} target="_blank" rel="noopener noreferrer">
          <span className="contact-ic">
            <GitHub />
          </span>
          <div>
            <small>GitHub</small>
            <b>{CONTACT.githubLabel}</b>
          </div>
          <External width={15} height={15} className="contact-go" />
        </a>

        <a className="contact-card" href={`tel:${CONTACT.phoneHref}`}>
          <span className="contact-ic">
            <Phone />
          </span>
          <div>
            <small>Phone</small>
            <b>{CONTACT.phone}</b>
          </div>
        </a>

        <div className="contact-card">
          <span className="contact-ic">
            <Pin />
          </span>
          <div>
            <small>Location</small>
            <b>{CONTACT.location}</b>
          </div>
        </div>
      </div>
      <p className="copied" aria-live="polite">
        {copied ? 'Email address copied' : ''}
      </p>
      <p className="hint">Earth imagery: Solar System Scope (CC BY 4.0), based on NASA data. Karnataka outline: Natural Earth.</p>
    </>
  );
}
