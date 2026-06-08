import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const FROM = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886'

export async function sendWhatsAppToVendor({
  to,
  storeName,
  orderId,
  items,
  city,
  total,
}: {
  to: string
  storeName: string
  orderId: string
  items: { name: string; quantity: number }[]
  city: string
  total: number
}): Promise<void> {
  const phone = to.replace(/\D/g, '')
  if (!phone) return

  const itemList = items.map((i) => `• ${i.name} x${i.quantity}`).join('\n')
  const orderRef = orderId.slice(0, 8).toUpperCase()

  const body =
    `🛍️ *Porosi e re #${orderRef}*\n` +
    `Dyqani: ${storeName}\n\n` +
    `${itemList}\n\n` +
    `📍 Qyteti: ${city}\n` +
    `💰 Totali: €${total.toFixed(2)}\n\n` +
    `Hyni në panelin tuaj për të konfirmuar porosinë.`

  await client.messages.create({
    from: FROM,
    to: `whatsapp:+${phone}`,
    body,
  })
}
