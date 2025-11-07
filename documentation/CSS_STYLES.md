# Especificación de Estilos CSS - Splitia

## 1. Información General

### 1.1 Propósito
Este documento define el sistema de diseño completo de Splitia, incluyendo colores, tipografía, espaciado, componentes y patrones de diseño para mantener consistencia visual en toda la aplicación.

### 1.2 Tecnologías Utilizadas
- **Tailwind CSS**: Framework de utilidades CSS
- **CSS Variables**: Para temas y valores dinámicos
- **OKLCH**: Espacio de color moderno para mejor consistencia
- **Dark Mode**: Soporte completo con clase `.dark`

### 1.3 Principios de Diseño
- **Minimalista y Funcional**: Enfoque en tareas del usuario con interfaces limpias
- **Consistencia Visual**: Jerarquía de información clara
- **Diseño Responsive**: Enfoque mobile-first con layouts fluidos
- **Accesibilidad**: Cumplimiento WCAG AA con contraste adecuado y estados de foco

---

## 2. Sistema de Colores

### 2.1 Paleta de Colores Principal

#### Color Primario (Brand)
```css
--primary: #66e3a5; /* Mint Green - Color de marca principal */
--primary-foreground: oklch(0.145 0 0); /* Texto sobre fondo primario */
```
- **Uso**: Botones principales, enlaces, elementos de acción, estados activos
- **Contraste**: Cumple WCAG AA para texto sobre fondo claro/oscuro

#### Colores Semánticos

**Éxito (Success)**
```css
--success: #4ade80; /* Verde claro */
```
- **Uso**: Mensajes de éxito, confirmaciones, estados positivos

**Advertencia (Warning)**
```css
--warning: #facc15; /* Amarillo */
```
- **Uso**: Alertas, advertencias, estados de atención

**Error (Destructive)**
```css
--destructive: #f87171; /* Rojo claro */
--destructive-foreground: oklch(0.985 0 0); /* Texto blanco */
```
- **Uso**: Errores, acciones destructivas, validaciones fallidas

**Info**
```css
--info: #38bdf8; /* Azul claro */
```
- **Uso**: Información, tooltips, mensajes informativos

### 2.2 Colores de Fondo

#### Modo Claro (Light Mode)
```css
--background: oklch(1 0 0); /* Blanco puro */
--foreground: oklch(0.145 0 0); /* Casi negro */
--card: oklch(1 0 0); /* Blanco para tarjetas */
--card-foreground: oklch(0.145 0 0); /* Texto en tarjetas */
--muted: oklch(0.97 0 0); /* Gris muy claro */
--muted-foreground: oklch(0.556 0 0); /* Gris medio */
```

#### Modo Oscuro (Dark Mode)
```css
.dark {
  --background: oklch(0.145 0 0); /* Casi negro */
  --foreground: oklch(0.985 0 0); /* Casi blanco */
  --card: oklch(0.205 0 0); /* Gris oscuro para tarjetas */
  --card-foreground: oklch(0.985 0 0); /* Texto blanco */
  --muted: oklch(0.269 0 0); /* Gris oscuro */
  --muted-foreground: oklch(0.708 0 0); /* Gris claro */
}
```

### 2.3 Colores de Borde e Inputs

#### Modo Claro
```css
--border: oklch(0.922 0 0); /* Gris claro */
--input: oklch(0.922 0 0); /* Mismo que border */
--ring: #66e3a5; /* Color primario para anillos de foco */
```

#### Modo Oscuro
```css
.dark {
  --border: oklch(1 0 0 / 10%); /* Blanco con 10% opacidad */
  --input: oklch(1 0 0 / 15%); /* Blanco con 15% opacidad */
  --ring: #66e3a5; /* Mismo color primario */
}
```

### 2.4 Colores de Sidebar

#### Modo Claro
```css
--sidebar: oklch(0.985 0 0); /* Blanco casi puro */
--sidebar-foreground: oklch(0.145 0 0); /* Texto oscuro */
--sidebar-primary: #66e3a5; /* Color primario */
--sidebar-accent: oklch(0.97 0 0); /* Gris muy claro */
--sidebar-border: oklch(0.922 0 0); /* Borde gris */
```

#### Modo Oscuro
```css
.dark {
  --sidebar: oklch(0.205 0 0); /* Gris oscuro */
  --sidebar-foreground: oklch(0.985 0 0); /* Texto claro */
  --sidebar-primary: #66e3a5; /* Color primario */
  --sidebar-accent: oklch(0.269 0 0); /* Gris medio */
  --sidebar-border: oklch(1 0 0 / 10%); /* Borde sutil */
}
```

### 2.5 Colores para Gráficos (Charts)

#### Modo Claro
```css
--chart-1: #66e3a5; /* Primario - Verde menta */
--chart-2: oklch(0.6 0.118 184.704); /* Azul */
--chart-3: oklch(0.398 0.07 227.392); /* Púrpura */
--chart-4: oklch(0.828 0.189 84.429); /* Amarillo */
--chart-5: oklch(0.769 0.188 70.08); /* Naranja */
```

#### Modo Oscuro
```css
.dark {
  --chart-1: #66e3a5; /* Primario */
  --chart-2: oklch(0.696 0.17 162.48); /* Azul claro */
  --chart-3: oklch(0.769 0.188 70.08); /* Amarillo */
  --chart-4: oklch(0.627 0.265 303.9); /* Púrpura */
  --chart-5: oklch(0.645 0.246 16.439); /* Naranja */
}
```

### 2.6 Uso de Colores en Tailwind

```html
<!-- Fondo y texto -->
<div class="bg-background text-foreground">...</div>

<!-- Tarjetas -->
<div class="bg-card text-card-foreground">...</div>

<!-- Botón primario -->
<button class="bg-primary text-primary-foreground">...</button>

<!-- Estados -->
<div class="bg-success">...</div>
<div class="bg-warning">...</div>
<div class="bg-destructive text-destructive-foreground">...</div>

<!-- Muted -->
<div class="bg-muted text-muted-foreground">...</div>
```

---

## 3. Tipografía

### 3.1 Familias de Fuentes

```css
--font-sans: var(--font-geist-sans); /* Fuente principal */
--font-mono: var(--font-geist-mono); /* Fuente monoespaciada */
```

**Fuentes:**
- **Geist Sans**: Fuente principal para UI, texto y títulos
- **Geist Mono**: Para código, números, datos técnicos

### 3.2 Escala de Tamaños

#### Headings (Títulos)
```css
/* Tailwind Classes */
h1: text-4xl (2.25rem / 36px) - font-bold (700)
h2: text-3xl (1.875rem / 30px) - font-bold (700)
h3: text-2xl (1.5rem / 24px) - font-semibold (600)
h4: text-xl (1.25rem / 20px) - font-semibold (600)
h5: text-lg (1.125rem / 18px) - font-medium (500)
h6: text-base (1rem / 16px) - font-medium (500)
```

#### Texto de Cuerpo
```css
/* Tailwind Classes */
body: text-base (1rem / 16px) - font-normal (400)
small: text-sm (0.875rem / 14px) - font-normal (400)
xs: text-xs (0.75rem / 12px) - font-normal (400)
```

#### Responsive Typography
```html
<!-- Títulos responsivos -->
<h1 class="text-2xl md:text-3xl lg:text-4xl">Título</h1>
<p class="text-sm md:text-base lg:text-lg">Texto</p>
```

### 3.3 Pesos de Fuente

```css
font-thin: 100
font-extralight: 200
font-light: 300
font-normal: 400 (default)
font-medium: 500
font-semibold: 600
font-bold: 700
font-extrabold: 800
font-black: 900
```

### 3.4 Altura de Línea

```css
leading-none: 1
leading-tight: 1.25
leading-snug: 1.375
leading-normal: 1.5 (default)
leading-relaxed: 1.625
leading-loose: 2
```

### 3.5 Espaciado de Letras

```css
tracking-tighter: -0.05em
tracking-tight: -0.025em
tracking-normal: 0 (default)
tracking-wide: 0.025em
tracking-wider: 0.05em
tracking-widest: 0.1em
```

---

## 4. Espaciado

### 4.1 Escala de Espaciado (Tailwind)

```css
/* Valores en rem */
space-0: 0
space-1: 0.25rem (4px)
space-2: 0.5rem (8px)
space-3: 0.75rem (12px)
space-4: 1rem (16px)
space-5: 1.25rem (20px)
space-6: 1.5rem (24px)
space-8: 2rem (32px)
space-10: 2.5rem (40px)
space-12: 3rem (48px)
space-16: 4rem (64px)
space-20: 5rem (80px)
space-24: 6rem (96px)
```

### 4.2 Patrones de Espaciado

#### Padding de Secciones
```html
<section class="py-20 px-6">...</section>
<!-- py-20: padding vertical 5rem -->
<!-- px-6: padding horizontal 1.5rem -->
```

#### Padding de Componentes
```html
<!-- Tarjetas -->
<div class="p-6">...</div>

<!-- Inputs -->
<input class="px-4 py-2">...</input>

<!-- Botones -->
<button class="px-4 py-2">...</button>
```

#### Gaps entre Elementos
```html
<!-- Grid con gap -->
<div class="grid gap-4 md:gap-6 lg:gap-8">...</div>

<!-- Flex con gap -->
<div class="flex gap-2 md:gap-4">...</div>
```

### 4.3 Márgenes

```html
<!-- Márgenes verticales -->
<div class="mt-4 mb-6">...</div>
<div class="my-8">...</div> <!-- margin top y bottom -->

<!-- Márgenes horizontales -->
<div class="ml-4 mr-6">...</div>
<div class="mx-auto">...</div> <!-- centrado horizontal -->
```

---

## 5. Componentes UI

### 5.1 Botones

#### Variantes de Botones

**Primario**
```html
<button class="bg-primary text-primary-foreground hover:bg-primary/90 
               px-4 py-2 rounded-md font-medium transition-colors">
  Botón Primario
</button>
```

**Secundario**
```html
<button class="bg-secondary text-secondary-foreground hover:bg-secondary/90 
               px-4 py-2 rounded-md font-medium transition-colors">
  Botón Secundario
</button>
```

**Outline**
```html
<button class="border border-input bg-transparent hover:bg-accent 
               hover:text-accent-foreground px-4 py-2 rounded-md 
               font-medium transition-colors">
  Botón Outline
</button>
```

**Ghost**
```html
<button class="hover:bg-accent hover:text-accent-foreground 
               px-4 py-2 rounded-md font-medium transition-colors">
  Botón Ghost
</button>
```

**Destructivo**
```html
<button class="bg-destructive text-destructive-foreground 
               hover:bg-destructive/90 px-4 py-2 rounded-md 
               font-medium transition-colors">
  Eliminar
</button>
```

#### Tamaños de Botones

```html
<!-- Extra Small -->
<button class="px-2 py-1 text-xs">...</button>

<!-- Small -->
<button class="px-3 py-1.5 text-sm">...</button>

<!-- Medium (default) -->
<button class="px-4 py-2 text-base">...</button>

<!-- Large -->
<button class="px-6 py-3 text-lg">...</button>

<!-- Extra Large -->
<button class="px-8 py-4 text-xl">...</button>
```

#### Estados de Botones

```html
<!-- Disabled -->
<button disabled class="opacity-50 cursor-not-allowed">...</button>

<!-- Loading -->
<button class="opacity-75 cursor-wait">
  <span class="animate-spin">⏳</span> Cargando...
</button>

<!-- Focus -->
<button class="focus:ring-2 focus:ring-primary focus:ring-offset-2">...</button>
```

### 5.2 Tarjetas (Cards)

#### Tarjeta Básica
```html
<div class="bg-card text-card-foreground rounded-xl border 
            shadow-sm p-6">
  <h3 class="text-xl font-semibold mb-2">Título</h3>
  <p class="text-muted-foreground">Contenido de la tarjeta</p>
</div>
```

#### Tarjeta Interactiva
```html
<div class="bg-card text-card-foreground rounded-xl border 
            shadow-sm hover:shadow-md transition-shadow 
            cursor-pointer p-6">
  Contenido interactivo
</div>
```

#### Tarjeta con Header y Footer
```html
<div class="bg-card text-card-foreground rounded-xl border shadow-sm">
  <!-- Header -->
  <div class="p-6 pb-2 flex justify-between items-start">
    <h3 class="text-xl font-semibold">Título</h3>
    <button>...</button>
  </div>
  
  <!-- Content -->
  <div class="p-6">
    Contenido principal
  </div>
  
  <!-- Footer -->
  <div class="p-6 pt-0 border-t">
    Acciones del footer
  </div>
</div>
```

### 5.3 Formularios e Inputs

#### Input de Texto
```html
<div class="space-y-2">
  <label class="text-sm font-medium text-foreground">
    Nombre
  </label>
  <input 
    type="text" 
    class="w-full rounded-md border border-input bg-background 
           px-3 py-2 text-sm ring-offset-background 
           focus-visible:outline-none focus-visible:ring-2 
           focus-visible:ring-primary focus-visible:ring-offset-2 
           disabled:cursor-not-allowed disabled:opacity-50"
    placeholder="Ingresa tu nombre"
  />
  <p class="text-xs text-muted-foreground">
    Texto de ayuda
  </p>
</div>
```

#### Select
```html
<select class="w-full rounded-md border border-input bg-background 
               px-3 py-2 text-sm focus-visible:outline-none 
               focus-visible:ring-2 focus-visible:ring-primary">
  <option>Opción 1</option>
  <option>Opción 2</option>
</select>
```

#### Textarea
```html
<textarea 
  class="w-full rounded-md border border-input bg-background 
         px-3 py-2 text-sm min-h-[80px] resize-none 
         focus-visible:outline-none focus-visible:ring-2 
         focus-visible:ring-primary"
  placeholder="Escribe aquí..."
></textarea>
```

#### Checkbox
```html
<label class="flex items-center space-x-2">
  <input 
    type="checkbox" 
    class="h-4 w-4 rounded border-input text-primary 
           focus:ring-2 focus:ring-primary"
  />
  <span class="text-sm">Acepto los términos</span>
</label>
```

#### Radio
```html
<label class="flex items-center space-x-2">
  <input 
    type="radio" 
    name="option" 
    class="h-4 w-4 border-input text-primary 
           focus:ring-2 focus:ring-primary"
  />
  <span class="text-sm">Opción 1</span>
</label>
```

#### Estados de Validación
```html
<!-- Error -->
<div class="space-y-2">
  <input class="border-destructive focus:ring-destructive" />
  <p class="text-sm text-destructive">Mensaje de error</p>
</div>

<!-- Success -->
<div class="space-y-2">
  <input class="border-success focus:ring-success" />
  <p class="text-sm text-success">Validación exitosa</p>
</div>
```

### 5.4 Navegación

#### Header
```html
<header class="sticky top-0 z-50 bg-background/80 backdrop-blur-md 
               border-b border-border">
  <div class="container mx-auto px-4 py-4 flex items-center 
               justify-between">
    <h1 class="text-2xl font-bold">Splitia</h1>
    <nav>...</nav>
  </div>
</header>
```

#### Sidebar
```html
<aside class="w-64 bg-sidebar text-sidebar-foreground 
              border-r border-sidebar-border">
  <nav class="p-4 space-y-2">
    <a href="#" class="flex items-center px-4 py-3 rounded-lg 
                        hover:bg-sidebar-accent hover:text-sidebar-accent-foreground 
                        transition-colors">
      <span>Dashboard</span>
    </a>
  </nav>
</aside>
```

#### Estado Activo en Navegación
```html
<a href="#" class="flex items-center px-4 py-3 rounded-lg 
                    bg-sidebar-accent text-sidebar-accent-foreground 
                    font-medium">
  Dashboard
</a>
```

#### Menú Móvil (Hamburger)
```html
<!-- Botón hamburger -->
<button class="md:hidden p-2 rounded-lg hover:bg-accent">
  <svg class="w-6 h-6">...</svg>
</button>

<!-- Menú móvil -->
<div class="md:hidden fixed inset-0 bg-background z-50">
  <nav class="p-4 space-y-2">...</nav>
</div>
```

### 5.5 Badges y Etiquetas

#### Badge Básico
```html
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full 
              text-xs font-semibold bg-primary/10 text-primary">
  Nuevo
</span>
```

#### Variantes de Badge
```html
<!-- Success -->
<span class="bg-success/10 text-success">Activo</span>

<!-- Warning -->
<span class="bg-warning/10 text-warning">Pendiente</span>

<!-- Destructive -->
<span class="bg-destructive/10 text-destructive">Eliminado</span>

<!-- Muted -->
<span class="bg-muted text-muted-foreground">Inactivo</span>
```

### 5.6 Alertas y Notificaciones

#### Alerta de Éxito
```html
<div class="rounded-lg bg-success/10 border border-success/20 
            text-success p-4">
  <div class="flex items-center">
    <svg>...</svg>
    <p class="ml-2">Operación exitosa</p>
  </div>
</div>
```

#### Alerta de Error
```html
<div class="rounded-lg bg-destructive/10 border border-destructive/20 
            text-destructive p-4">
  <div class="flex items-center">
    <svg>...</svg>
    <p class="ml-2">Ha ocurrido un error</p>
  </div>
</div>
```

#### Toast Notification
```html
<div class="fixed bottom-4 right-4 bg-card text-card-foreground 
            border shadow-lg rounded-lg p-4 min-w-[300px] 
            animate-in slide-in-from-bottom">
  <p>Notificación toast</p>
</div>
```

### 5.7 Modales y Diálogos

#### Modal Básico
```html
<!-- Overlay -->
<div class="fixed inset-0 bg-black/50 z-50 flex items-center 
            justify-center">
  <!-- Modal -->
  <div class="bg-card text-card-foreground rounded-xl shadow-lg 
              max-w-md w-full mx-4 p-6">
    <h2 class="text-2xl font-bold mb-4">Título del Modal</h2>
    <p class="text-muted-foreground mb-6">Contenido</p>
    <div class="flex justify-end gap-2">
      <button class="px-4 py-2 rounded-md">Cancelar</button>
      <button class="px-4 py-2 rounded-md bg-primary">Aceptar</button>
    </div>
  </div>
</div>
```

### 5.8 Tablas

#### Tabla Básica
```html
<div class="rounded-lg border">
  <table class="w-full">
    <thead>
      <tr class="border-b bg-muted/50">
        <th class="px-4 py-3 text-left text-sm font-semibold">
          Columna 1
        </th>
        <th class="px-4 py-3 text-left text-sm font-semibold">
          Columna 2
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b hover:bg-muted/50 transition-colors">
        <td class="px-4 py-3 text-sm">Dato 1</td>
        <td class="px-4 py-3 text-sm">Dato 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 5.9 Loading States

#### Spinner
```html
<div class="animate-spin rounded-full h-8 w-8 border-t-2 
            border-b-2 border-primary"></div>
```

#### Skeleton Loader
```html
<div class="space-y-4">
  <div class="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
  <div class="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
  <div class="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
</div>
```

---

## 6. Border Radius (Esquinas Redondeadas)

### 6.1 Variables CSS

```css
--radius: 0.625rem; /* 10px - Radio base */
--radius-sm: calc(var(--radius) - 4px); /* 6px */
--radius-md: calc(var(--radius) - 2px); /* 8px */
--radius-lg: var(--radius); /* 10px */
--radius-xl: calc(var(--radius) + 4px); /* 14px */
```

### 6.2 Uso en Tailwind

```html
<!-- Sin esquinas redondeadas -->
<div class="rounded-none">...</div>

<!-- Pequeño -->
<div class="rounded-sm">...</div>

<!-- Medio -->
<div class="rounded-md">...</div>

<!-- Grande -->
<div class="rounded-lg">...</div>

<!-- Extra Grande -->
<div class="rounded-xl">...</div>

<!-- Completamente redondeado -->
<div class="rounded-full">...</div>
```

---

## 7. Sombras (Shadows)

### 7.1 Escala de Sombras

```html
<!-- Sin sombra -->
<div class="shadow-none">...</div>

<!-- Pequeña -->
<div class="shadow-sm">...</div>

<!-- Media (default) -->
<div class="shadow-md">...</div>

<!-- Grande -->
<div class="shadow-lg">...</div>

<!-- Extra Grande -->
<div class="shadow-xl">...</div>

<!-- 2XL -->
<div class="shadow-2xl">...</div>

<!-- Sombra interna -->
<div class="shadow-inner">...</div>
```

### 7.2 Uso en Componentes

```html
<!-- Tarjeta con sombra suave -->
<div class="bg-card shadow-sm">...</div>

<!-- Tarjeta interactiva -->
<div class="bg-card shadow-sm hover:shadow-md transition-shadow">
  ...
</div>
```

---

## 8. Animaciones y Transiciones

### 8.1 Transiciones Comunes

```css
/* Transición de colores */
transition-colors duration-200

/* Transición de sombras */
transition-shadow duration-200

/* Transición completa */
transition-all duration-200

/* Transición rápida */
transition-transform duration-150

/* Transición lenta */
transition-opacity duration-300
```

### 8.2 Animaciones Personalizadas

#### Accordion
```css
--animate-accordion-down: accordion-down 0.2s ease-out;
--animate-accordion-up: accordion-up 0.2s ease-out;

@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
```

#### Fade In
```html
<div class="animate-in fade-in duration-300">...</div>
```

#### Slide In
```html
<div class="animate-in slide-in-from-bottom duration-300">...</div>
```

#### Pulse (para loading)
```html
<div class="animate-pulse">...</div>
```

#### Spin (para spinners)
```html
<div class="animate-spin">...</div>
```

### 8.3 Hover Effects

```html
<!-- Escala en hover -->
<div class="hover:scale-105 transition-transform">...</div>

<!-- Opacidad en hover -->
<button class="hover:opacity-90 transition-opacity">...</button>

<!-- Rotación en hover -->
<button class="hover:rotate-90 transition-transform">...</button>
```

---

## 9. Breakpoints Responsive

### 9.1 Breakpoints de Tailwind

```css
/* Mobile First */
sm: 640px   /* Small devices (phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large devices (desktops) */
2xl: 1536px /* Ultra wide screens */
```

### 9.2 Patrones Responsive

#### Grid Responsive
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  ...
</div>
```

#### Flex Responsive
```html
<div class="flex flex-col md:flex-row gap-4">
  ...
</div>
```

#### Texto Responsive
```html
<h1 class="text-2xl md:text-3xl lg:text-4xl">Título</h1>
<p class="text-sm md:text-base lg:text-lg">Texto</p>
```

#### Padding Responsive
```html
<div class="p-4 md:p-6 lg:p-8">...</div>
```

#### Visibilidad Responsive
```html
<!-- Oculto en móvil, visible en desktop -->
<div class="hidden md:block">...</div>

<!-- Visible en móvil, oculto en desktop -->
<div class="block md:hidden">...</div>
```

---

## 10. Estados de Interacción

### 10.1 Estados de Foco

```html
<!-- Focus visible (accesibilidad) -->
<button class="focus-visible:outline-none focus-visible:ring-2 
               focus-visible:ring-primary focus-visible:ring-offset-2">
  Botón
</button>

<!-- Focus para inputs -->
<input class="focus:ring-2 focus:ring-primary focus:border-primary" />
```

### 10.2 Estados de Hover

```html
<!-- Hover básico -->
<button class="hover:bg-accent hover:text-accent-foreground">
  Botón
</button>

<!-- Hover con transición -->
<div class="hover:shadow-md transition-shadow">...</div>
```

### 10.3 Estados de Active

```html
<button class="active:scale-95 transition-transform">
  Botón
</button>
```

### 10.4 Estados de Disabled

```html
<button disabled class="opacity-50 cursor-not-allowed">
  Botón Deshabilitado
</button>
```

---

## 11. Utilidades Específicas de Splitia

### 11.1 Gradientes de Fondo

```html
<!-- Gradiente para secciones -->
<section class="bg-gradient-to-b from-blue-50 to-white 
                dark:from-gray-900 dark:to-gray-800">
  ...
</section>
```

### 11.2 Patrón de Grid de Fondo

```html
<div class="absolute inset-0 bg-[url('/grid.svg')] bg-center 
            [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]">
</div>
```

### 11.3 Backdrop Blur

```html
<!-- Header con blur -->
<header class="bg-background/80 backdrop-blur-md">...</header>

<!-- Modal overlay con blur -->
<div class="backdrop-blur-sm bg-black/50">...</div>
```

### 11.4 Formato de Moneda

```html
<!-- Alineación derecha para montos -->
<div class="text-right font-semibold">
  $1,234.56
</div>
```

---

## 12. Accesibilidad

### 12.1 Contraste de Colores

- **Texto normal**: Mínimo 4.5:1 de contraste
- **Texto grande**: Mínimo 3:1 de contraste
- **Elementos interactivos**: Mínimo 3:1 de contraste

### 12.2 Estados de Foco

```html
<!-- Siempre mostrar foco visible -->
<button class="focus-visible:outline-2 focus-visible:outline-primary 
               focus-visible:outline-offset-2">
  Botón Accesible
</button>
```

### 12.3 ARIA Labels

```html
<!-- Botones sin texto visible -->
<button aria-label="Cerrar">
  <svg>...</svg>
</button>

<!-- Estados de carga -->
<div aria-live="polite" aria-busy="true">
  Cargando...
</div>
```

### 12.4 Navegación por Teclado

- Todos los elementos interactivos deben ser accesibles con Tab
- Orden lógico de tabulación
- Atajos de teclado documentados

---

## 13. Ejemplos de Componentes Completos

### 13.1 Card de Gasto

```html
<div class="bg-card text-card-foreground rounded-xl border shadow-sm 
            hover:shadow-md transition-shadow cursor-pointer p-6">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold">Cena en restaurante</h3>
    <span class="text-xl font-bold text-primary">$45.50</span>
  </div>
  <div class="flex items-center gap-2 text-sm text-muted-foreground">
    <span>Hace 2 días</span>
    <span>•</span>
    <span>Grupo: Viaje a París</span>
  </div>
  <div class="mt-4 flex items-center gap-2">
    <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center 
                 justify-center">
      <span class="text-xs font-semibold">JD</span>
    </div>
    <span class="text-sm">Pagado por Juan</span>
  </div>
</div>
```

### 13.2 Formulario de Crear Gasto

```html
<form class="space-y-6">
  <div class="space-y-2">
    <label class="text-sm font-medium">Descripción</label>
    <input 
      type="text" 
      class="w-full rounded-md border border-input bg-background 
             px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary"
      placeholder="Ej: Cena en restaurante"
    />
  </div>
  
  <div class="grid grid-cols-2 gap-4">
    <div class="space-y-2">
      <label class="text-sm font-medium">Monto</label>
      <input 
        type="number" 
        step="0.01"
        class="w-full rounded-md border border-input bg-background 
               px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary"
      />
    </div>
    <div class="space-y-2">
      <label class="text-sm font-medium">Moneda</label>
      <select class="w-full rounded-md border border-input bg-background 
                     px-3 py-2">
        <option>USD</option>
        <option>EUR</option>
      </select>
    </div>
  </div>
  
  <div class="flex justify-end gap-2">
    <button type="button" class="px-4 py-2 rounded-md border">
      Cancelar
    </button>
    <button type="submit" class="px-4 py-2 rounded-md bg-primary 
                                   text-primary-foreground">
      Crear Gasto
    </button>
  </div>
</form>
```

### 13.3 Lista de Grupos

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="bg-card text-card-foreground rounded-xl border shadow-sm 
              hover:shadow-md transition-shadow cursor-pointer p-6">
    <div class="flex items-center gap-3 mb-4">
      <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center 
                   justify-center">
        <span class="text-lg font-semibold">VP</span>
      </div>
      <div>
        <h3 class="font-semibold">Viaje a París</h3>
        <p class="text-sm text-muted-foreground">5 miembros</p>
      </div>
    </div>
    <div class="flex items-center justify-between text-sm">
      <span class="text-muted-foreground">Balance total</span>
      <span class="font-semibold">$1,234.56</span>
    </div>
  </div>
</div>
```

---

## 14. Guía de Uso Rápido

### 14.1 Checklist de Estilos

- [ ] Usar variables CSS para colores
- [ ] Implementar modo oscuro con `.dark`
- [ ] Usar clases de Tailwind para espaciado consistente
- [ ] Aplicar transiciones en elementos interactivos
- [ ] Verificar contraste de colores para accesibilidad
- [ ] Implementar estados de foco visibles
- [ ] Usar breakpoints responsive apropiados
- [ ] Aplicar sombras sutiles para profundidad
- [ ] Mantener consistencia en border-radius
- [ ] Usar tipografía responsive

### 14.2 Convenciones de Nombrado

- Usar clases de Tailwind en lugar de CSS personalizado cuando sea posible
- Variables CSS para valores que cambian entre temas
- Prefijos consistentes: `bg-`, `text-`, `border-`, `hover:`, `focus:`
- Modificadores responsive: `md:`, `lg:`, `xl:`

### 14.3 Mejores Prácticas

1. **Mobile First**: Diseñar primero para móvil, luego expandir
2. **Consistencia**: Usar el mismo espaciado y tamaños en componentes similares
3. **Accesibilidad**: Siempre incluir estados de foco y contraste adecuado
4. **Performance**: Minimizar CSS personalizado, usar Tailwind utilities
5. **Mantenibilidad**: Documentar componentes complejos

---

## 15. Recursos y Referencias

### 15.1 Documentación
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### 15.2 Herramientas
- [Tailwind Play](https://play.tailwindcss.com/) - Para probar clases
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - Verificar contraste
- [Coolors](https://coolors.co/) - Generador de paletas

---

**Versión del Documento**: 1.0  
**Última Actualización**: 2024  
**Mantenido por**: Equipo de Diseño Splitia

