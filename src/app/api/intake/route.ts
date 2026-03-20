import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import type { Database } from '@/lib/database.types'

const ALLOWED_ORIGINS = [
  'https://v0-3-n1-hvac-website.vercel.app',
  'https://www.3n1hvac.com',
  'https://3n1hvac.com',
]

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  const headers = corsHeaders(origin)

  try {
    const body = await req.json()
    const { name, phone, email, zipCode, serviceNeeded, preferredTime, additionalDetails } = body

    if (!name || !phone || !zipCode || !serviceNeeded) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers })
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Find or create customer by phone
    let customerId: string
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .maybeSingle()

    if (existing) {
      customerId = existing.id
      await supabase
        .from('customers')
        .update({ name, ...(email ? { email } : {}) })
        .eq('id', customerId)
    } else {
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({ name, phone, email: email || null, address: zipCode })
        .select('id')
        .single()
      if (error || !newCustomer) throw error ?? new Error('Failed to create customer')
      customerId = newCustomer.id
    }

    // Build description from form fields
    const descParts = [`Service: ${serviceNeeded}`]
    if (preferredTime && preferredTime !== 'No preference') {
      descParts.push(`Preferred time: ${preferredTime}`)
    }
    descParts.push(`Zip: ${zipCode}`)
    if (additionalDetails) descParts.push(`\n${additionalDetails}`)

    // Create the follow-up item
    const { data: followUp, error: fuError } = await supabase
      .from('follow_up_items')
      .insert({
        customer_id: customerId,
        title: `Website Request – ${serviceNeeded}`,
        description: descParts.join('\n'),
        status: 'needs_pricing',
        category: 'callback',
        priority: 'standard',
      })
      .select('id')
      .single()

    if (fuError || !followUp) throw fuError ?? new Error('Failed to create follow-up')

    // Send email notification (non-blocking — follow-up is already created)
    if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://3n1-hvac.vercel.app'

    await resend.emails.send({
      from: 'noreply@3n1hvac.com',
      to: ['reagan@3n1hvac.com', 'micah@3n1hvac.com'],
      subject: `New Website Request – ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#f26a1b;padding:20px 24px;border-radius:8px 8px 0 0">
            <h2 style="color:white;margin:0;font-size:20px">New Service Request from Website</h2>
          </div>
          <div style="border:1px solid #e5e5e5;border-top:none;padding:24px;border-radius:0 0 8px 8px">
            <table style="width:100%;border-collapse:collapse">
              <tr style="border-bottom:1px solid #f0f0f0">
                <td style="padding:10px 0;font-weight:600;color:#444;width:140px">Name</td>
                <td style="padding:10px 0;color:#111">${name}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0">
                <td style="padding:10px 0;font-weight:600;color:#444">Phone</td>
                <td style="padding:10px 0;color:#111">${phone}</td>
              </tr>
              ${email ? `
              <tr style="border-bottom:1px solid #f0f0f0">
                <td style="padding:10px 0;font-weight:600;color:#444">Email</td>
                <td style="padding:10px 0;color:#111">${email}</td>
              </tr>` : ''}
              <tr style="border-bottom:1px solid #f0f0f0">
                <td style="padding:10px 0;font-weight:600;color:#444">Zip Code</td>
                <td style="padding:10px 0;color:#111">${zipCode}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0">
                <td style="padding:10px 0;font-weight:600;color:#444">Service Needed</td>
                <td style="padding:10px 0;color:#111">${serviceNeeded}</td>
              </tr>
              ${preferredTime ? `
              <tr style="border-bottom:1px solid #f0f0f0">
                <td style="padding:10px 0;font-weight:600;color:#444">Preferred Time</td>
                <td style="padding:10px 0;color:#111">${preferredTime}</td>
              </tr>` : ''}
              ${additionalDetails ? `
              <tr>
                <td style="padding:10px 0;font-weight:600;color:#444;vertical-align:top">Details</td>
                <td style="padding:10px 0;color:#111">${additionalDetails}</td>
              </tr>` : ''}
            </table>
            <div style="margin-top:24px">
              <a href="${appUrl}/follow-ups/${followUp.id}"
                style="background:#f26a1b;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">
                View in Follow-Up Manager →
              </a>
            </div>
          </div>
        </div>
      `,
    })
    } // end if RESEND_API_KEY

    return NextResponse.json({ success: true, id: followUp.id }, { headers })
  } catch (err) {
    console.error('Intake error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers })
  }
}
