# Configuración de Resend Email API

## Instalación

Resend ya está instalado en el proyecto. Para configurarlo:

## Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Resend Email API
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Otras variables
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Obtener API Key de Resend

1. Ve a [resend.com](https://resend.com) y crea una cuenta
2. Ve a la sección "API Keys" en el dashboard
3. Crea una nueva API key
4. Copia la clave (comienza con `re_`)
5. Pégala en tu archivo `.env.local` como `RESEND_API_KEY`

## Configurar Dominio (Producción)

Para producción, necesitas verificar un dominio:

1. Ve a "Domains" en el dashboard de Resend
2. Agrega tu dominio
3. Configura los registros DNS según las instrucciones
4. Una vez verificado, usa ese dominio en `RESEND_FROM_EMAIL`

Para desarrollo, puedes usar `onboarding@resend.dev` (ya configurado por defecto).

## Uso

### En el servidor (API Routes)

```typescript
import { sendWelcomeEmail } from '@/lib/email/resend';

// En una API route o Server Action
await sendWelcomeEmail('user@example.com', 'Nombre del Usuario');
```

### Desde una API Route

```typescript
// POST /api/email
{
  "type": "welcome",
  "to": "user@example.com",
  "name": "Nombre del Usuario"
}
```

## Tipos de Email Disponibles

### 1. Email de Bienvenida
```typescript
sendWelcomeEmail(to: string, name: string)
```

### 2. Recuperación de Contraseña
```typescript
sendPasswordResetEmail(to: string, resetToken: string, name: string)
```

### 3. Notificación de Ticket de Soporte
```typescript
sendSupportTicketEmail(to: string, ticketId: string, title: string)
```

### 4. Email Personalizado
```typescript
sendEmail({
  to: 'user@example.com',
  subject: 'Asunto',
  html: '<p>Contenido HTML</p>',
  text: 'Contenido texto plano',
  from: 'custom@yourdomain.com', // opcional
  replyTo: 'support@yourdomain.com', // opcional
})
```

## API Route

Se ha creado una API route en `/api/email` que acepta los siguientes tipos:

- `welcome` - Email de bienvenida
- `password-reset` - Recuperación de contraseña
- `support-ticket` - Notificación de ticket
- `custom` - Email personalizado

Ejemplo de uso desde el cliente:

```typescript
const response = await fetch('/api/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'welcome',
    to: 'user@example.com',
    name: 'Nombre',
  }),
});
```

## Archivos Creados

- `src/lib/email/resend.ts` - Utilidades de email con Resend
- `src/app/api/email/route.ts` - API route para enviar emails

