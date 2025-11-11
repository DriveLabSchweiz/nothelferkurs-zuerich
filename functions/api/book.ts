interface Env {
  DB: D1Database;
  MAILGUN_API_KEY: string;
  MAILGUN_DOMAIN: string;
}

interface BookingRequest {
  courseId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  terms: boolean;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: BookingRequest = await context.request.json();

    // Validate input
    if (!body.courseId || !body.firstName || !body.lastName || !body.email || !body.phone || !body.terms) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert booking into database
    const bookingId = crypto.randomUUID();
    await context.env.DB.prepare(
      `INSERT INTO bookings (id, course_id, first_name, last_name, email, phone, created_at, status) 
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 'pending')`
    )
      .bind(bookingId, body.courseId, body.firstName, body.lastName, body.email, body.phone)
      .run();

    // Get course details
    const course = await context.env.DB.prepare(
      'SELECT * FROM courses WHERE id = ?'
    )
      .bind(body.courseId)
      .first();

    if (!course) {
      return new Response(JSON.stringify({ error: 'Course not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send confirmation email via Mailgun
    await sendConfirmationEmail(context.env, body, course);

    // Schedule reminder email (24h before course start)
    const courseStartDate = new Date(course.start_date as string);
    const reminderDate = new Date(courseStartDate.getTime() - 24 * 60 * 60 * 1000);
    
    await context.env.DB.prepare(
      `INSERT INTO email_queue (id, booking_id, email_type, scheduled_for, status) 
       VALUES (?, ?, 'reminder', ?, 'pending')`
    )
      .bind(crypto.randomUUID(), bookingId, reminderDate.toISOString())
      .run();

    return new Response(JSON.stringify({ success: true, bookingId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Booking error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function sendConfirmationEmail(env: Env, booking: BookingRequest, course: any) {
  const emailContent = `
Hallo ${booking.firstName} ${booking.lastName},

vielen Dank für Ihre Buchung des Nothelferkurses bei DriveLab!

Kursdetails:
- Datum: ${new Date(course.day1).toLocaleDateString('de-CH')} & ${new Date(course.day2).toLocaleDateString('de-CH')}
- Zeit: Tag 1: ${course.day1_time}, Tag 2: ${course.day2_time}
- Ort: ${course.location}
- Preis: CHF ${course.price}.-

Cashback:
Nach Abschluss des Kurses erhalten Sie CHF 50.- Cashback auf Ihr DriveLab Wallet gutgeschrieben.

Zahlung:
Bitte folgen Sie diesem Link zur Zahlung und Aktivierung Ihres Cashbacks:
https://drivelab.ch/payment?booking=${booking.email}

Wichtige Hinweise:
- Bringen Sie bitte einen gültigen Ausweis mit
- Stornierungen sind bis 6 Tage vor Kursbeginn kostenlos möglich
- Bei Fragen erreichen Sie uns unter +41 76 237 13 07

Wir freuen uns auf Ihre Teilnahme!

Mit freundlichen Grüssen
Ihr DriveLab Team

---
DriveLab GmbH
Lauriedhofweg 12
CH-6300 Zug
info@drivelab.ch
www.drivelab.ch
  `.trim();

  const formData = new FormData();
  formData.append('from', `DriveLab <noreply@${env.MAILGUN_DOMAIN}>`);
  formData.append('to', booking.email);
  formData.append('subject', 'Buchungsbestätigung - Nothelferkurs Zürich');
  formData.append('text', emailContent);

  const response = await fetch(
    `https://api.eu.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`api:${env.MAILGUN_API_KEY}`)}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Mailgun API error: ${response.statusText}`);
  }
}
