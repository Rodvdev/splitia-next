# Splitia Next.js Application

Aplicación completa de gestión de gastos compartidos construida con Next.js 16, React 19, TypeScript y Tailwind CSS.

## 🚀 Características

- ✅ Next.js 16 con App Router
- ✅ React 19.2
- ✅ TypeScript
- ✅ Tailwind CSS 4 con sistema de diseño completo
- ✅ Autenticación con JWT
- ✅ Gestión de grupos y gastos compartidos
- ✅ Sistema de presupuestos
- ✅ Chat integrado
- ✅ Sistema de settlements
- ✅ Soporte y tickets
- ✅ Gestión de suscripciones
- ✅ Panel administrativo

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Backend API corriendo en `http://localhost:8080/api`

## 🛠️ Instalación

1. **Clonar el repositorio** (si aplica)
   ```bash
   git clone <repository-url>
   cd splitia-next
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local` con tus configuraciones:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
splitia-next/
├── src/
│   ├── app/                    # App Router (Next.js 16)
│   │   ├── (auth)/            # Rutas de autenticación
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Rutas protegidas
│   │   │   ├── dashboard/
│   │   │   ├── groups/
│   │   │   ├── expenses/
│   │   │   ├── budgets/
│   │   │   ├── chat/
│   │   │   ├── settlements/
│   │   │   ├── subscriptions/
│   │   │   ├── support/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes base (shadcn/ui)
│   │   ├── layout/           # Componentes de layout
│   │   ├── auth/             # Componentes de autenticación
│   │   └── common/           # Componentes comunes
│   ├── lib/                  # Utilidades y configuraciones
│   │   ├── api/             # Cliente API y servicios
│   │   ├── auth/            # Utilidades de autenticación
│   │   └── utils/           # Funciones helper
│   ├── store/               # Estado global (Zustand)
│   └── types/               # Tipos TypeScript
├── public/                  # Archivos estáticos
├── proxy.ts                 # Proxy (reemplaza middleware.ts)
├── next.config.ts           # Configuración de Next.js
├── tsconfig.json            # Configuración de TypeScript
└── package.json             # Dependencias
```

## 🎨 Sistema de Diseño

El proyecto utiliza un sistema de diseño completo basado en:
- **Tailwind CSS 4** con variables CSS personalizadas
- **OKLCH** para colores con mejor consistencia
- **Modo oscuro** soportado
- **Componentes reutilizables** siguiendo shadcn/ui patterns

Ver `documentation/CSS_STYLES.md` para más detalles.

## 🔐 Autenticación

La aplicación utiliza JWT para autenticación:
- Tokens almacenados en localStorage
- Refresh automático de tokens
- Protección de rutas con `AuthGuard`
- Interceptores de Axios para manejo automático

## 📡 API Client

El cliente API está configurado con:
- Interceptores para tokens JWT
- Refresh automático de tokens
- Manejo de errores centralizado
- Tipos TypeScript completos

Ver `src/lib/api/` para todos los servicios disponibles.

## 🧩 Componentes Principales

### UI Components
- `Button` - Botones con variantes
- `Input` - Inputs de formulario
- `Card` - Tarjetas contenedoras
- `Badge` - Etiquetas y badges
- `Label` - Labels para formularios
- `Skeleton` - Loading states

### Layout Components
- `Sidebar` - Navegación lateral
- `Header` - Barra superior con búsqueda y perfil
- `AuthGuard` - Protección de rutas

### Common Components
- `LoadingSpinner` - Spinner de carga
- `ErrorMessage` - Mensajes de error
- `EmptyState` - Estados vacíos

## 🛣️ Rutas Disponibles

### Autenticación
- `/login` - Iniciar sesión
- `/register` - Crear cuenta

### Dashboard
- `/dashboard` - Dashboard principal
- `/dashboard/groups` - Gestión de grupos
- `/dashboard/expenses` - Gestión de gastos
- `/dashboard/budgets` - Presupuestos
- `/dashboard/chat` - Chat
- `/dashboard/settlements` - Settlements
- `/dashboard/subscriptions` - Suscripciones
- `/dashboard/support` - Soporte
- `/dashboard/profile` - Perfil
- `/dashboard/settings` - Configuración

## 🔧 Scripts Disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

## 📚 Documentación

- `documentation/product-specification.md` - Especificación completa del producto
- `documentation/NAVIGATION_STRUCTURE.md` - Estructura de navegación
- `documentation/CSS_STYLES.md` - Sistema de diseño y estilos
- `documentation/NEXTJS_16_DOCUMENTATION.md` - Documentación de Next.js 16

## 🚧 Próximos Pasos

1. Implementar funcionalidad completa de cada módulo
2. Agregar tests con Jest y React Testing Library
3. Implementar WebSockets para chat en tiempo real
4. Agregar gráficos con Recharts
5. Implementar panel administrativo completo
6. Optimizar performance y SEO
7. Agregar internacionalización (i18n)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

Desarrollado para Splitia - Gestión de Gastos Compartidos

---

**Nota**: Asegúrate de que el backend API esté corriendo antes de iniciar la aplicación frontend.
