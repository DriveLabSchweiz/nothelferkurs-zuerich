import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string, locale: string = 'de-CH'): string {
  return new Date(date).toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTime(time: string): string {
  return time;
}

export function getLanguageFromUrl(url: URL): 'de' | 'en' {
  const pathname = url.pathname;
  if (pathname.startsWith('/en')) {
    return 'en';
  }
  return 'de';
}
