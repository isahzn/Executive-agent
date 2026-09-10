import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  const year = 2026;
  return (
    <footer id="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-about">
            <div className="footer-logo">
              <span
                className="logo-mark"
                style={{ width: 28, height: 28, fontSize: 11 }}
              >
                BT
              </span>
              Bantex&nbsp;Trading&nbsp;(Pvt)&nbsp;Ltd
            </div>
            <p>
              Wholesale and retail stationery and electrical goods, based in
              Colombo 12.
            </p>
          </div>

          <div className="footer-col">
            <h5>Shop</h5>
            <ul>
              <li>
                <Link href="/stationery">Stationery</Link>
              </li>
              <li>
                <Link href="/electrical">Electrical Goods</Link>
              </li>
              <li>
                <Link href="/#products">Featured Products</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Contact</h5>
            <ul>
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              {site.phone.map((p) => (
                <li key={p.tel}>
                  <a href={p.tel}>{p.label}</a>
                </li>
              ))}
              <li>
                <Link href="/contact">{site.address.full}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} {site.name}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
