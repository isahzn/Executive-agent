import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Bantex Trading (Pvt) Ltd.",
};

export default function ContactPage() {
  return (
    <main>
      <header className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <span>Contact</span>
          </div>
          <span className="eyebrow">Get in touch</span>
          <h1>Contact Bantex Trading</h1>
          <p>
            Reach out for wholesale or retail orders, stationery, or electrical
            goods.
          </p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="contact-grid">
            <div>
              <div className="contact-card">
                <div className="contact-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h4>Address</h4>
                  <p>
                    {site.address.street}
                    <br />
                    {site.address.city}.
                  </p>
                </div>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <h4>Phone</h4>
                  <p>
                    {site.phone.map((p, i) => (
                      <span key={p.tel}>
                        <a href={p.tel}>{p.label}</a>
                        {i < site.phone.length - 1 ? <br /> : null}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 4h16v16H4z" opacity="0" />
                    <path d="M22 6c0 1.1-.9 2-2 2H4a2 2 0 0 1-2-2m20 0-10 7L2 6m20 0v12H2V6" />
                  </svg>
                </div>
                <div>
                  <h4>Email</h4>
                  <p>
                    <a href={`mailto:${site.email}`}>{site.email}</a>
                  </p>
                </div>
              </div>
            </div>

            <div className="contact-map">
              <iframe
                src={site.mapUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${site.name} location — ${site.address.full}`}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
