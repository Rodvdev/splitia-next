import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendWelcomeEmail, sendPasswordResetEmail, sendSupportTicketEmail } from '@/lib/email/resend';

/**
 * API Route para enviar emails usando Resend
 * POST /api/email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    let result;

    switch (type) {
      case 'welcome':
        if (!data.to || !data.name) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: to, name' },
            { status: 400 }
          );
        }
        result = await sendWelcomeEmail(data.to, data.name);
        break;

      case 'password-reset':
        if (!data.to || !data.resetToken || !data.name) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: to, resetToken, name' },
            { status: 400 }
          );
        }
        result = await sendPasswordResetEmail(data.to, data.resetToken, data.name);
        break;

      case 'support-ticket':
        if (!data.to || !data.ticketId || !data.title) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: to, ticketId, title' },
            { status: 400 }
          );
        }
        result = await sendSupportTicketEmail(data.to, data.ticketId, data.title);
        break;

      case 'custom':
        if (!data.to || !data.subject || (!data.html && !data.text)) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: to, subject, html or text' },
            { status: 400 }
          );
        }
        result = await sendEmail({
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text,
          from: data.from,
          replyTo: data.replyTo,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type. Use: welcome, password-reset, support-ticket, or custom' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.id,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in email API route:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

