import { format as dateFnsFormat, formatDistance, type Locale } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';

const locales: Record<string, Locale> = {
  es,
  en: enUS,
  pt: ptBR,
};

export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date, format: string = 'PPP', locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeObj = locales[locale] || locales.en;
  return dateFnsFormat(dateObj, format, { locale: localeObj });
}

export function formatRelativeTime(date: string | Date, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeObj = locales[locale] || locales.en;
  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: localeObj });
}
