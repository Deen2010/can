import nodemailer, { type Transporter } from "nodemailer";
import { logger } from "./logger";

let _transport: Transporter | null = null;
let _attempted = false;

function getTransport(): Transporter | null {
  if (_attempted) return _transport;
  _attempted = true;

  const host = process.env["SMTP_HOST"];
  const portRaw = process.env["SMTP_PORT"];
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];

  if (!host || !user || !pass) {
    logger.warn(
      "SMTP env vars not configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — emails will only be logged",
    );
    return null;
  }

  const port = portRaw ? Number(portRaw) : 587;
  const secure = port === 465;

  _transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  logger.info({ host, port, user }, "SMTP transport initialized");
  return _transport;
}

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendMail(input: SendMailInput): Promise<void> {
  const from =
    process.env["SMTP_FROM"] ||
    process.env["SMTP_USER"] ||
    "Mainusch <no-reply@mainusch.local>";
  const transport = getTransport();

  if (!transport) {
    logger.info(
      { to: input.to, subject: input.subject },
      "[email-stub] would send email (SMTP not configured)",
    );
    return;
  }

  try {
    const info = await transport.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    logger.info({ to: input.to, messageId: info.messageId }, "email sent");
  } catch (err) {
    logger.error({ err, to: input.to }, "failed to send email");
  }
}

export interface BookingEmailData {
  customerName: string;
  serviceName: string;
  stylistName: string;
  startsAt: Date;
  durationMinutes: number;
  priceCents: number;
  bookingId: string;
}

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

function fmtTime(d: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function renderBookingConfirmation(data: BookingEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const datum = fmtDate(data.startsAt);
  const uhr = fmtTime(data.startsAt);
  const preis = `€${(data.priceCents / 100).toFixed(2).replace(".", ",")}`;
  const subject = `Terminanfrage bei MAINUSCH · ${datum} ${uhr}`;

  const text = `Hi ${data.customerName},

danke für deine Terminanfrage bei MAINUSCH!

Termin:    ${datum}, ${uhr}
Service:   ${data.serviceName} (${data.durationMinutes} Min.)
Barber:    ${data.stylistName}
Preis:     ${preis}

Status:    Wartet auf Bestätigung

Du bekommst eine zweite Mail, sobald Can deinen Termin bestätigt hat.
Bei Fragen einfach auf diese Mail antworten oder per Instagram melden: @can.v912

Bis bald,
MAINUSCH · Hinterhof Cuts
Buchungs-ID: ${data.bookingId}
`;

  const html = `<!doctype html>
<html lang="de">
<body style="margin:0;padding:0;background:#f3ece0;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3ece0;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#f3ece0;border:3px solid #1a1a1a">
        <tr><td style="background:repeating-linear-gradient(45deg,#b91d2c 0 8px,#f3ece0 8px 16px,#19345a 16px 24px,#f3ece0 24px 32px);height:12px"></td></tr>
        <tr><td style="padding:32px 36px 12px;text-align:center">
          <div style="font-family:Impact,'Arial Narrow',sans-serif;font-size:34px;letter-spacing:6px;color:#1a1a1a">MAINUSCH</div>
          <div style="font-style:italic;font-size:13px;color:#b91d2c;letter-spacing:3px;margin-top:6px">— Barber · Est. 2026 —</div>
        </td></tr>
        <tr><td style="padding:24px 36px 8px;font-size:18px">
          Hi <strong>${escapeHtml(data.customerName)}</strong>,
        </td></tr>
        <tr><td style="padding:0 36px 20px;font-size:15px;line-height:1.55;color:#333">
          danke für deine <strong>Terminanfrage</strong>! Wir haben sie bekommen und melden uns mit der Bestätigung.
        </td></tr>
        <tr><td style="padding:0 36px 24px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #1a1a1a;background:#ffffff">
            <tr><td style="padding:20px 24px">
              <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#b91d2c;font-weight:bold;font-family:Helvetica,Arial,sans-serif;margin-bottom:12px">Dein Termin</div>
              <table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">
                <tr><td style="color:#666;width:90px">Datum</td><td><strong>${escapeHtml(datum)}</strong></td></tr>
                <tr><td style="color:#666">Uhrzeit</td><td><strong>${escapeHtml(uhr)} Uhr</strong></td></tr>
                <tr><td style="color:#666">Service</td><td><strong>${escapeHtml(data.serviceName)}</strong> · ${data.durationMinutes} Min.</td></tr>
                <tr><td style="color:#666">Barber</td><td><strong>${escapeHtml(data.stylistName)}</strong></td></tr>
                <tr><td style="color:#666">Preis</td><td style="font-family:Impact,sans-serif;color:#b91d2c;font-size:22px">${escapeHtml(preis)}</td></tr>
                <tr><td style="color:#666">Status</td><td style="color:#19345a;font-weight:bold;text-transform:uppercase;letter-spacing:2px;font-size:11px">Wartet auf Bestätigung</td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 36px 24px;font-size:13px;line-height:1.6;color:#444">
          Du bekommst eine zweite Mail, sobald Can deinen Termin bestätigt hat. Bei Fragen einfach auf diese Mail antworten oder via Instagram melden:
          <a href="https://instagram.com/can.v912" style="color:#b91d2c;text-decoration:none"><strong>@can.v912</strong></a>.
        </td></tr>
        <tr><td style="padding:18px 36px;background:#1a1a1a;color:#f3ece0;text-align:center;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase">
          MAINUSCH · Hinterhof Cuts<br/>
          <span style="color:#b91d2c;font-style:italic;text-transform:none;letter-spacing:1px">Buchungs-ID: ${escapeHtml(data.bookingId)}</span>
        </td></tr>
        <tr><td style="background:repeating-linear-gradient(45deg,#b91d2c 0 8px,#f3ece0 8px 16px,#19345a 16px 24px,#f3ece0 24px 32px);height:12px"></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
