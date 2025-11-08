'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight, Users, Receipt, Wallet, MessageSquare, Zap, Shield, BarChart3, CheckSquare } from 'lucide-react';
import { publicStatsApi } from '@/lib/api/public-stats';

function formatUserCount(count: number): string {
  if (count === 0) return '5+';
  if (count < 10) return `${count}+`;
  if (count < 100) return `${Math.floor(count / 10) * 10}+`;
  if (count < 1000) return `${Math.floor(count / 100) * 100}+`;
  if (count < 10000) return `${(count / 1000).toFixed(1)}K+`;
  return `${Math.floor(count / 1000)}K+`;
}

export default function LandingPage() {
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    const loadUserCount = async () => {
      try {
        const count = await publicStatsApi.getUserCount();
        setUserCount(count);
      } catch (error) {
        // Silently fail and use default value
        console.error('Failed to load user count:', error);
      }
    };

    loadUserCount();
  }, []);
  const features = [
    {
      icon: Users,
      title: 'Gestión de Grupos',
      description: 'Crea y gestiona grupos para compartir gastos con amigos, familia o compañeros de trabajo.',
    },
    {
      icon: Receipt,
      title: 'División de Gastos',
      description: 'Divide gastos de manera justa y automática. Olvídate de los cálculos manuales.',
    },
    {
      icon: Wallet,
      title: 'Presupuestos',
      description: 'Establece presupuestos y mantén el control de tus finanzas grupales.',
    },
    {
      icon: MessageSquare,
      title: 'Chat Integrado',
      description: 'Comunícate con tu grupo directamente desde la plataforma.',
    },
    {
      icon: CheckSquare,
      title: 'Kanban de Tareas',
      description: 'Gestiona tareas y proyectos con tableros Kanban visuales (Planes PRO y ENTERPRISE).',
    },
    {
      icon: Zap,
      title: 'Asistente de IA',
      description: 'Automatiza tareas financieras con nuestro asistente inteligente.',
    },
    {
      icon: BarChart3,
      title: 'Análisis Avanzados',
      description: 'Visualiza tus gastos con gráficos y reportes detallados (Planes PRO y ENTERPRISE).',
    },
    {
      icon: Shield,
      title: 'Seguro y Confiable',
      description: 'Tus datos están protegidos con encriptación de nivel empresarial.',
    },
  ];

  const plans = [
    {
      name: 'FREE',
      price: '$0',
      period: 'mes',
      description: 'Perfecto para empezar',
      features: [
        '1 grupo máximo',
        '5 miembros por grupo',
        '50 gastos por grupo',
        '3 presupuestos por grupo',
        '10 solicitudes IA/mes',
        'Soporte por email',
      ],
      limitations: ['Sin Kanban', 'Sin análisis avanzados', 'Sin exportación'],
      cta: 'Empezar Gratis',
      popular: false,
    },
    {
      name: 'PRO',
      price: '$9.99',
      period: 'mes',
      description: 'Para equipos pequeños',
      features: [
        '10 grupos máximo',
        '50 miembros por grupo',
        '1,000 gastos por grupo',
        '50 presupuestos por grupo',
        '500 solicitudes IA/mes',
        'Kanban de tareas',
        'Análisis avanzados',
        'Exportación de datos',
        'Soporte prioritario',
      ],
      limitations: [],
      cta: 'Comenzar Prueba',
      popular: true,
    },
    {
      name: 'ENTERPRISE',
      price: '$29.99',
      period: 'mes',
      description: 'Para empresas',
      features: [
        'Grupos ilimitados',
        'Miembros ilimitados',
        'Gastos ilimitados',
        'Presupuestos ilimitados',
        'IA ilimitada',
        'Kanban de tareas',
        'Análisis avanzados',
        'Exportación de datos',
        'Soporte prioritario 24/7',
        'API personalizada',
      ],
      limitations: [],
      cta: 'Contactar Ventas',
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: 'María González',
      role: 'Estudiante',
      content: 'Splitia ha simplificado completamente cómo dividimos los gastos del departamento. Ya no tenemos que hacer cálculos manuales.',
      avatar: '👩',
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Emprendedor',
      content: 'El Kanban integrado es perfecto para gestionar proyectos con mi equipo. La funcionalidad PRO vale cada centavo.',
      avatar: '👨',
    },
    {
      name: 'Ana Martínez',
      role: 'Gerente de Proyecto',
      content: 'La capacidad de exportar datos y los análisis avanzados nos han ayudado a tomar mejores decisiones financieras.',
      avatar: '👩‍💼',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent px-2">
              Divide Gastos, Comparte Experiencias
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-4 sm:mb-6 px-2">
              La plataforma más fácil para gestionar gastos compartidos con grupos. División automática, presupuestos y más.
            </p>
            {userCount !== null && (
              <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8 px-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <p className="text-sm sm:text-base md:text-lg font-semibold text-muted-foreground">
                  <span className="text-primary font-bold">{formatUserCount(userCount)}</span> usuarios confían en nosotros
                </p>
              </div>
            )}
            {userCount === null && (
              <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8 px-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <p className="text-sm sm:text-base md:text-lg font-semibold text-muted-foreground">
                  <span className="text-primary font-bold">5+</span> usuarios confían en nosotros
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 px-2">Características Principales</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2">
              Todo lo que necesitas para gestionar gastos compartidos de manera eficiente
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 px-2">Planes y Precios</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2">
              Elige el plan que mejor se adapte a tus necesidades
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? 'border-primary border-2 shadow-lg md:scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                      Más Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl sm:text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm sm:text-base text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <li key={limitationIndex} className="flex items-start gap-2 text-muted-foreground">
                        <span className="h-5 w-5 mt-0.5 flex-shrink-0">✗</span>
                        <span className="text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block w-full">
                    <Button
                      className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 px-2">Lo que Dicen Nuestros Usuarios</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2">
              {userCount !== null ? `${formatUserCount(userCount)} usuarios` : 'Miles de usuarios'} confían en Splitia para gestionar sus gastos compartidos
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">¿Listo para Empezar?</h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 px-2">
            Únete a {userCount !== null ? formatUserCount(userCount) : 'miles de'} usuarios que ya están simplificando sus gastos compartidos
          </p>
          <Link href="/register" className="inline-block">
            <Button size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8">
              Crear Cuenta Gratis
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">Splitia</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Gestiona tus gastos compartidos con facilidad</p>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <Link href="/login" className="text-sm hover:underline">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="text-sm hover:underline">
                Registrarse
              </Link>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-muted-foreground">
            <p>© 2025 Splitia. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
