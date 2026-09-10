// Server-side owner email notification (Gmail SMTP with an app password).
// This module is only imported by the Stripe webhook — never by client code —
// and reads all credentials from environment variables. If SMTP is not
// configured it throws, and the webhook catches that to record a failed
// notification status without touching the (already paid) order.
//
// No card / payment-credential data is ever included in the email body.
import type { Order } from "./types";
import { formatPriceMinor } from "../money";

export class EmailNotConfiguredError extends Error {}

function emailConfig() {
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.OWNER_NOTIFICATION_EMAIL ?? user ?? "";
  const from = process.env.MAIL_FROM ?? to;

  if (!user || !pass || !to) {
    throw new EmailNotConfiguredError(
      "SMTP is not configured (SMTP_USER / SMTP_PASS / OWNER_NOTIFICATION_EMAIL)."
    );
  }
  return { host, port, user, pass, to, from };
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" });
}

function linesText(order: Order): string {
  return order.lines
    .map((line) => {
      const options = line.options.map((o) => `${o.label}: ${o.value}`).join(", ");
      const optionText = options ? ` (${options})` : "";
      const unit = formatPriceMinor(line.unitPriceMinor);
      const total = formatPriceMinor(line.lineTotalMinor);
      return `* ${line.productName}${optionText} — ${line.quantity} × ${unit} = ${total}`;
    })
    .join("\n");
}

function linesHtml(order: Order): string {
  return order.lines
    .map((line) => {
      const options = line.options.map((o) => `${o.label}: ${o.value}`).join(", ");
      const optionText = options ? ` &middot; ${options}` : "";
      return `<tr>
        <td style="padding:6px 0;border-bottom:1px solid #eee;">${line.productName}${optionText}<br>
          <span style="color:#6b7a99;font-size:12px;">${line.quantity} × ${formatPriceMinor(
            line.unitPriceMinor
          )}</span></td>
        <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;">${formatPriceMinor(
          line.lineTotalMinor
        )}</td>
      </tr>`;
    })
    .join("");
}

function paymentLine(order: Order): string {
  const method = order.paymentMethod === "cod" ? "Cash on Delivery" : "Card";
  return `${method} — ${order.paymentStatus}`;
}

function buildSubject(order: Order): string {
  return `New order ${order.id} from ${order.customer.name}`;
}

function buildText(order: Order): string {
  const c = order.customer;
  return `New order received.

Order: ${order.id}
Date: ${formatDate(order.createdAt)}
Payment: ${paymentLine(order)}

Customer
Name: ${c.name}
Email: ${c.email}
Phone: ${c.phone}
Delivery address: ${c.address}

Products
${linesText(order)}

Total: ${formatPriceMinor(order.totalMinor)}

Log in to the admin dashboard to update the order status.`;
}

function buildHtml(order: Order): string {
  const c = order.customer;
  return `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#0b1e3d;">
  <h2 style="margin:0 0 4px;">New order received</h2>
  <p style="margin:0 0 16px;color:#6b7a99;">Order ${order.id} &middot; ${formatDate(
    order.createdAt
  )} &middot; Payment: ${paymentLine(order)}</p>

  <h3 style="margin:0 0 6px;font-size:15px;">Customer</h3>
  <p style="margin:0 0 16px;line-height:1.5;">
    <strong>${escapeHtml(c.name)}</strong><br>
    ${escapeHtml(c.email)}<br>
    ${escapeHtml(c.phone)}<br>
    ${escapeHtml(c.address)}
  </p>

  <h3 style="margin:0 0 6px;font-size:15px;">Products</h3>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    ${linesHtml(order)}
  </table>

  <p style="margin:14px 0 0;font-size:16px;font-weight:bold;">Total: ${formatPriceMinor(
    order.totalMinor
  )}</p>

  <p style="margin-top:24px;color:#6b7a99;font-size:13px;">Log in to the admin
  dashboard to update the order status.</p>
</body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[ch] ?? ch;
  });
}

// Send the owner notification for a newly-paid order. Throws on transport or
// configuration failure — the caller records that and keeps the order paid.
export async function sendOrderNotificationEmail(order: Order): Promise<void> {
  const config = emailConfig();

  // Import dynamically so the module can be type-checked/loaded even when SMTP
  // is intentionally absent in some environments.
  const { default: nodemailer } = await import("nodemailer");

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    subject: buildSubject(order),
    text: buildText(order),
    html: buildHtml(order),
  });
}
