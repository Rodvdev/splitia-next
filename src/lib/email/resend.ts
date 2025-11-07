import { Resend } from 'resend';

// Inicializar Resend con la API key desde variables de entorno
// Solo se inicializa si existe la API key para evitar errores durante el build
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
};

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailTemplate {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envía un email usando Resend
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn('RESEND_API_KEY not configured');
      return {
        success: false,
        id: null,
        error: 'RESEND_API_KEY not configured',
      };
    }

    const from = options.from || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    const emailData = {
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      ...(options.html && { html: options.html }),
      ...(options.text && { text: options.text }),
      ...(options.replyTo && { replyTo: options.replyTo }),
    };

    const result = await resend.emails.send(emailData as unknown as Parameters<typeof resend.emails.send>[0]);

    return {
      success: true,
      id: result.data?.id,
      error: null,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      id: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Envía un email de bienvenida
 */
export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a Splitia</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #66e3a5 0%, #4ade80 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">¡Bienvenido a Splitia!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hola <strong>${name}</strong>,</p>
          <p>Gracias por unirte a Splitia. Estamos emocionados de tenerte a bordo.</p>
          <p>Con Splitia puedes:</p>
          <ul>
            <li>Gestionar gastos compartidos con amigos y familia</li>
            <li>Crear grupos y dividir gastos fácilmente</li>
            <li>Realizar seguimiento de presupuestos</li>
            <li>Chatear con tus grupos</li>
          </ul>
          <p style="margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
               style="background: #66e3a5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Ir al Dashboard
            </a>
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Si tienes alguna pregunta, no dudes en contactarnos.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Splitia. Todos los derechos reservados.</p>
        </div>
      </body>
    </html>
  `;

  const text = `
Bienvenido a Splitia, ${name}!

Gracias por unirte a Splitia. Estamos emocionados de tenerte a bordo.

Con Splitia puedes:
- Gestionar gastos compartidos con amigos y familia
- Crear grupos y dividir gastos fácilmente
- Realizar seguimiento de presupuestos
- Chatear con tus grupos

Visita tu dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard

Si tienes alguna pregunta, no dudes en contactarnos.

© ${new Date().getFullYear()} Splitia. Todos los derechos reservados.
  `;

  return sendEmail({
    to,
    subject: '¡Bienvenido a Splitia!',
    html,
    text,
  });
}

/**
 * Envía un email de recuperación de contraseña
 */
export async function sendPasswordResetEmail(to: string, resetToken: string, name: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperar Contraseña - Splitia</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #66e3a5 0%, #4ade80 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Recuperar Contraseña</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hola <strong>${name}</strong>,</p>
          <p>Recibimos una solicitud para restablecer tu contraseña en Splitia.</p>
          <p>Haz clic en el botón siguiente para crear una nueva contraseña:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #66e3a5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            O copia y pega este enlace en tu navegador:<br>
            <a href="${resetUrl}" style="color: #66e3a5; word-break: break-all;">${resetUrl}</a>
          </p>
          <p style="margin-top: 30px; color: #999; font-size: 12px;">
            Este enlace expirará en 1 hora. Si no solicitaste este cambio, puedes ignorar este email.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Splitia. Todos los derechos reservados.</p>
        </div>
      </body>
    </html>
  `;

  const text = `
Recuperar Contraseña - Splitia

Hola ${name},

Recibimos una solicitud para restablecer tu contraseña en Splitia.

Haz clic en el siguiente enlace para crear una nueva contraseña:
${resetUrl}

Este enlace expirará en 1 hora. Si no solicitaste este cambio, puedes ignorar este email.

© ${new Date().getFullYear()} Splitia. Todos los derechos reservados.
  `;

  return sendEmail({
    to,
    subject: 'Recuperar Contraseña - Splitia',
    html,
    text,
  });
}

/**
 * Envía un email de notificación de ticket de soporte
 */
export async function sendSupportTicketEmail(to: string, ticketId: string, title: string) {
  const ticketUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/support`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket de Soporte Creado - Splitia</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #66e3a5 0%, #4ade80 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Ticket de Soporte Creado</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Tu ticket de soporte ha sido creado exitosamente.</p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>ID del Ticket:</strong> ${ticketId}</p>
            <p style="margin: 5px 0 0 0;"><strong>Asunto:</strong> ${title}</p>
          </div>
          <p>Nuestro equipo revisará tu solicitud y te responderá pronto.</p>
          <p style="margin-top: 30px;">
            <a href="${ticketUrl}" 
               style="background: #66e3a5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Ver Ticket
            </a>
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Splitia. Todos los derechos reservados.</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Ticket de Soporte Creado - ${ticketId}`,
    html,
  });
}

export { getResend };

