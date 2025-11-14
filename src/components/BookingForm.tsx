import React, { useState, useEffect } from 'react';
import translations from '../data/translations.json';

interface Course {
  id: string;
  startDate: string;
  day1: string;
  day2: string;
  day1Time: string;
  day2Time: string;
}

interface Props {
  courses: Course[];
  lang: 'de' | 'en';
  selectedCourseId?: string | null;
}

export default function BookingForm({ courses, lang, selectedCourseId }: Props) {
  const t = translations[lang].booking;
  const [formData, setFormData] = useState({
    courseId: selectedCourseId || '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    zipCode: '',
    city: '',
    terms: false,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (selectedCourseId) {
      setFormData((prev) => ({ ...prev, courseId: selectedCourseId }));
    }
  }, [selectedCourseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.terms) {
      alert('Please accept the terms and conditions.');
      return;
    }
    setStatus('loading');
    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Booking failed');
      }
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <h3 className="text-2xl font-semibold text-green-700 dark:text-green-400">{t.success}</h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kursdatum</label>
        <select
          id="courseId"
          name="courseId"
          value={formData.courseId}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="" disabled>Kurs auswählen</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {new Date(course.day1).toLocaleDateString(lang === 'de' ? 'de-CH' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} ({course.day1Time}) & {new Date(course.day2).toLocaleDateString(lang === 'de' ? 'de-CH' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} ({course.day2Time})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium">{t.firstName}</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium">{t.lastName}</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">{t.email}</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium">{t.phone}</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <div>
        <label htmlFor="street" className="block text-sm font-medium">{lang === 'de' ? 'Strasse und Hausnummer' : 'Street and Number'}</label>
        <input
          type="text"
          id="street"
          name="street"
          value={formData.street}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium">{lang === 'de' ? 'PLZ' : 'ZIP Code'}</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium">{lang === 'de' ? 'Ort' : 'City'}</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          checked={formData.terms}
          onChange={handleChange}
          required
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
          {t.termsAccept} <a href={lang === 'de' ? '/terms' : '/en/terms'} target="_blank" className="underline hover:text-blue-600">{t.termsLink}</a>.
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {status === 'loading' ? 'Wird geladen...' : t.submit}
        </button>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 text-center">{t.error}</p>
      )}
    </form>
  );
}
