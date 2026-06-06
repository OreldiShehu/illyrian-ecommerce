import { Resend } from 'resend'
import { render } from '@react-email/render'
import * as React from 'react'
import CustomerWelcome from '@/emails/CustomerWelcome'
import VendorWelcome from '@/emails/VendorWelcome'
import OrderConfirmation from '@/emails/OrderConfirmation'
import NewOrderAlert from '@/emails/NewOrderAlert'
import OrderStatusUpdate from '@/emails/OrderStatusUpdate'
import CommissionReminder from '@/emails/CommissionReminder'
import PriceDropAlert from '@/emails/PriceDropAlert'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Zaza\'s E-Commerce <noreply@zazas.al>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zazas-ecommerce.vercel.app'

async function sendEmail(to: string, subject: string, component: React.ReactElement): Promise<void> {
  const html = await render(component)
  await resend.emails.send({ from: FROM, to, subject, html })
}

export async function sendCustomerWelcome(to: string, name: string): Promise<void> {
  await sendEmail(
    to,
    'Mirë se vini në Zaza\'s E-Commerce',
    React.createElement(CustomerWelcome, { name, appUrl: APP_URL })
  )
}

export async function sendVendorWelcome(to: string, storeName: string): Promise<void> {
  await sendEmail(
    to,
    'Dyqani juaj në Zaza\'s E-Commerce',
    React.createElement(VendorWelcome, { storeName, appUrl: APP_URL })
  )
}

export async function sendOrderConfirmation(
  to: string,
  props: {
    customerName: string
    orderId: string
    items: { name: string; quantity: number; price: number; size?: string; color?: string }[]
    total: number
    deliveryFee: number
    shippingAddress: string
    shippingCity: string
  }
): Promise<void> {
  await sendEmail(
    to,
    `Porosia #${props.orderId.slice(0, 8).toUpperCase()} u konfirmua`,
    React.createElement(OrderConfirmation, { ...props })
  )
}

export async function sendNewOrderAlert(
  to: string,
  props: {
    orderId: string
    storeName: string
    items: { name: string; quantity: number; price: number; size?: string; color?: string }[]
    customerCity: string
    total: number
  }
): Promise<void> {
  await sendEmail(
    to,
    `Porosi e re #${props.orderId.slice(0, 8).toUpperCase()}`,
    React.createElement(NewOrderAlert, { ...props, appUrl: APP_URL })
  )
}

export async function sendOrderStatusUpdate(
  to: string,
  props: {
    customerName: string
    orderId: string
    status: 'confirmed' | 'shipped'
    vendorName?: string
  }
): Promise<void> {
  const subjects = {
    confirmed: 'Porosia juaj u konfirmua nga shitësi',
    shipped: 'Porosia juaj është dërguar',
  }
  await sendEmail(
    to,
    subjects[props.status],
    React.createElement(OrderStatusUpdate, { ...props, appUrl: APP_URL })
  )
}

export async function sendCommissionReminder(
  to: string,
  props: {
    storeName: string
    amountOwed: number
    dueDate: string
  }
): Promise<void> {
  await sendEmail(
    to,
    'Komisioni i papaguar — Zaza\'s E-Commerce',
    React.createElement(CommissionReminder, { ...props, appUrl: APP_URL })
  )
}

export async function sendPriceDropAlert(
  to: string,
  props: {
    customerName: string
    productName: string
    oldPrice: number
    newPrice: number
    productSlug: string
  }
): Promise<void> {
  await sendEmail(
    to,
    `Çmimi u ul për: ${props.productName}`,
    React.createElement(PriceDropAlert, { ...props, appUrl: APP_URL })
  )
}

export async function sendNewsletterWelcome(to: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Faleminderit që u abonuat!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;">
        <h1 style="color:#000;font-size:20px;font-weight:700;">Mirësevini në listën tonë!</h1>
        <p style="color:#444;font-size:14px;line-height:1.7;">
          Do të merrni njoftime për dyqane të reja, oferta ekskluzive dhe produktet më të reja çdo javë.
        </p>
        <p style="color:#999;font-size:11px;">© 2026 Zaza's E-Commerce</p>
      </div>
    `,
  })
}
