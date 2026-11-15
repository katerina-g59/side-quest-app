// Side Quest Generátor – Edge Function "feedback-email"
// Pošle e-mail (přes Resend), když přibude nový řádek v tabulce "feedback".
// Volá ji jen Database Webhook (INSERT do public.feedback) s tajnou hlavičkou "x-webhook-secret".
//
// ZÁLOHA: tento soubor jen kopíruje kód z Supabase dashboardu (Edge Functions → feedback-email).
// Nejsou tu žádné klíče ani e-mailová adresa. Ty jsou jen v Supabase → Edge Functions → Secrets:
//   RESEND_API_KEY  – klíč z Resend
//   WEBHOOK_SECRET  – dlouhé náhodné heslo, stejné jako hlavička ve webhooku
//   NOTIFY_EMAIL    – kam se mají e-maily posílat
//   FROM_EMAIL      – (nepovinné) odesílatel; bez vlastní domény zůstává "onboarding@resend.dev"
//
// V nastavení funkce musí být VYPNUTÉ "Verify JWT" – ochranu dělá tajná hlavička.

const TYPES: Record<string, { name: string; subject: string }> = {
  chyba: { name: "Chyba 🐛", subject: "🐛 Nová chyba v Side Quest appce" },
  zpetna_vazba: { name: "Zpětná vazba 📩", subject: "📩 Nová zpětná vazba v Side Quest appce" },
  quest: { name: "Navrhnout quest ✨", subject: "✨ Nový návrh questu v Side Quest appce" },
};

// Porovná dvě hesla tak, aby z doby odpovědi nešlo nic vyčíst
function sameSecret(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

// Text od uživatelky se do HTML vkládá jen "očištěný" (žádné vlastní odkazy ani formátování)
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
}

// "2026-11-15T20:04:00Z" → "15. 11. 2026 21:04" (český čas)
function czechTime(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso || "neznámý čas";
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("cs-CZ", {
      timeZone: "Europe/Prague", day: "numeric", month: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(date).map(part => [part.type, part.value]),
  );
  return `${p.day}. ${p.month}. ${p.year} ${p.hour}:${p.minute}`;
}

function reply(status: number, text: string): Response {
  return new Response(text, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return reply(405, "Jen POST");

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
  const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";
  const NOTIFY_EMAIL = Deno.env.get("NOTIFY_EMAIL") ?? "";
  const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Side Quest <onboarding@resend.dev>";
  if (!RESEND_API_KEY || !WEBHOOK_SECRET || !NOTIFY_EMAIL) {
    console.error("Chybí secret RESEND_API_KEY, WEBHOOK_SECRET nebo NOTIFY_EMAIL");
    return reply(500, "Funkce není nastavená");
  }

  // 1. Pustíme dál jen náš webhook (správná tajná hlavička)
  if (!sameSecret(req.headers.get("x-webhook-secret") ?? "", WEBHOOK_SECRET)) {
    return reply(401, "Nepovoleno");
  }

  // 2. Bereme jen nové řádky v tabulce feedback
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return reply(400, "Špatná data");
  }
  if (payload?.type !== "INSERT" || payload?.table !== "feedback" || !payload?.record) {
    return reply(200, "Nic k odeslání");
  }

  const row = payload.record;
  const type = TYPES[row.type] ?? { name: String(row.type), subject: "💌 Nová zpráva v Side Quest appce" };
  const message = String(row.message ?? "");
  const instagram = row.instagram ? String(row.instagram) : "";
  const time = czechTime(String(row.created_at ?? ""));
  const device = row.type === "chyba" && row.device_info ? String(row.device_info) : "";

  // Instagram jako odkaz, jen když vypadá jako opravdové jméno účtu
  const igValid = /^[A-Za-z0-9._]{1,30}$/.test(instagram);
  const igHtml = !instagram ? ""
    : igValid ? `<a href="https://www.instagram.com/${instagram}/">@${escapeHtml(instagram)}</a>`
    : escapeHtml(instagram);

  // 3. Poskládáme e-mail (HTML + obyčejný text)
  const rows: [string, string][] = [
    ["Typ", escapeHtml(type.name)],
    ["Čas", escapeHtml(time)],
  ];
  if (instagram) rows.push(["Instagram", igHtml]);

  const html = `
<div style="font-family:Arial,sans-serif;color:#35211F;max-width:560px">
  <h2 style="color:#772C3A;margin:0 0 16px">${escapeHtml(type.subject)}</h2>
  <table style="border-collapse:collapse;margin-bottom:16px">
    ${rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:bold">${k}</td><td style="padding:4px 0">${v}</td></tr>`).join("")}
  </table>
  <div style="font-weight:bold;margin-bottom:6px">Zpráva</div>
  <div style="white-space:pre-wrap;background:#F4E5A7;padding:12px 14px;border-radius:10px">${escapeHtml(message)}</div>
  ${device ? `<div style="font-weight:bold;margin:16px 0 6px">Info o zařízení</div>
  <div style="white-space:pre-wrap;font-family:monospace;font-size:12px;background:#E8C5C3;padding:12px 14px;border-radius:10px">${escapeHtml(device)}</div>` : ""}
  <p style="font-size:12px;opacity:.7;margin-top:20px">Všechny zprávy: Supabase → Table Editor → feedback</p>
</div>`;

  const lines = [`Typ: ${type.name}`, `Čas: ${time}`];
  if (instagram) lines.push(`Instagram: @${instagram}`);
  lines.push("", "Zpráva:", message);
  if (device) lines.push("", "Info o zařízení:", device);
  const text = lines.join("\n");

  // 4. Odeslání přes Resend
  const resend = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: [NOTIFY_EMAIL], subject: type.subject, html, text }),
  });

  if (!resend.ok) {
    console.error("Resend odpověděl", resend.status, await resend.text());
    return reply(502, "E-mail se nepodařilo odeslat");
  }
  return reply(200, "E-mail odeslán");
});
