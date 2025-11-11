interface Env {
  DB: D1Database;
  MAILGUN_API_KEY: string;
  MAILGUN_DOMAIN: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // Get pending reminder emails that are due
    const now = new Date().toISOString();
    const pendingEmails = await context.env.DB.prepare(
      `SELECT eq.*, b.first_name, b.last_name, b.email, c.day1, c.day1_time, c.day2_time, c.location
       FROM email_queue eq
       JOIN bookings b ON eq.booking_id = b.id
       JOIN courses c ON b.course_id = c.id
       WHERE eq.status = 'pending' 
       AND eq.scheduled_for <= ?
       LIMIT 10`
    )
      .bind(now)
      .all();

    if (!pendingEmails.results || pendingEmails.results.length === 0) {
      return new Response(JSON.stringify({ message: 'No pending emails' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const emailData of pendingEmails.results) {
      try {
        await sendReminderEmail(context.env, emailData);
        
        // Mark as sent
        await context.env.DB.prepare(
          `UPDATE email_queue 
           SET status = 'sent', sent_at = datetime('now')
           WHERE id = ?`
        )
          .bind(emailData.id)
          .run();
        
        sentCount++;
      } catch (error) {
        console.error(`Failed to send email ${emailData.id}:`, error);
        
        // Mark as failed
        await context.env.DB.prepare(
          `UPDATE email_queue 
           SET status = 'failed', error_message = ?
           WHERE id = ?`
        )
          .bind(error instanceof Error ? error.message : 'Unknown error', emailData.id)
          .run();
        
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Reminder emails processed', 
        sent: sentCount, 
        errors: errorCount 
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Scheduled task error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function sendReminderEmail(env: Env, emailData: any) {
  const emailContent = `
Hallo ${emailData.first_name} ${emailData.last_name},

dies ist eine freundliche Erinnerung an Ihren Nothelferkurs morgen!

Kursdetails:
- Datum: ${new Date(emailData.day1).toLocaleDateString('de-CH')}
- Zeit: ${emailData.day1_time}
- Ort: ${emailData.location}

Wichtige Hinweise:
- Bringen Sie bitte einen gültigen Ausweis mit
- Seien Sie pünktlich vor Ort
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
  formData.append('to', emailData.email);
  formData.append('subject', 'Erinnerung: Ihr Nothelferkurs morgen');
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
