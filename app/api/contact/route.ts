import { NextResponse } from 'next/server'

const FORM_EMAIL = process.env.FORMSUBMIT_EMAIL || 'smilestoriesjalandhar@gmail.com'

type ContactPayload = {
  name?: string
  phone?: string
  email?: string
  query?: string
  'Enquiry Type'?: string
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ContactPayload

    if (!payload.name || !payload.phone || !payload.email || !payload.query) {
      return NextResponse.json(
        { message: 'Please fill all required fields.' },
        { status: 400 },
      )
    }

    const response = await fetch(`https://formsubmit.co/ajax/${FORM_EMAIL}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        'Enquiry Type': payload['Enquiry Type'] || 'Not selected',
        query: payload.query,
        _subject: 'New Contact Form Enquiry - Smile Stories',
        _captcha: 'false',
        _template: 'table',
      }),
    })

    const text = await response.text()
    let data: { message?: string; success?: string | boolean } = {}

    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { message: text }
    }

    if (!response.ok || data.success === false) {
      return NextResponse.json(
        { message: data.message || 'FormSubmit rejected the submission.' },
        { status: response.status || 502 },
      )
    }

    return NextResponse.json({
      message: data.message || "Message sent! We'll be in touch soon.",
    })
  } catch (error) {
    console.error('Contact form error:', error)

    return NextResponse.json(
      { message: 'Could not send the message right now. Please try again.' },
      { status: 500 },
    )
  }
}
