import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, company, email, phone, msg } = await req.json();

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({ error: "Telegram yapılandırılmamış" }, { status: 500 });
  }

  const text = [
    "📬 *Yeni İletişim Mesajı*",
    "",
    `👤 *Ad Soyad:* ${name}`,
    company ? `🏢 *Firma:* ${company}` : null,
    `📧 *E-posta:* ${email}`,
    phone ? `📞 *Telefon:* ${phone}` : null,
    "",
    `💬 *Mesaj:*\n${msg}`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
