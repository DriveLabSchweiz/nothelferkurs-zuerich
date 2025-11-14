/**
 * Cloudflare Pages Function für Kursbuchungen
 * Verwendet Mailgun für E-Mail-Versand
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const data = await request.json();

    // Validierung
    if (!data.courseId || !data.firstName || !data.lastName || !data.email || !data.phone || !data.street || !data.zipCode || !data.city) {
      return new Response(JSON.stringify({ error: 'Alle Felder sind erforderlich' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // E-Mail-Versand via Mailgun
    const mailgunDomain = 'mg.nothelferkurs-zuerich.ch';
    const mailgunApiKey = '02300200-6d1542e2';
    
    // Kursdaten laden
    const coursesResponse = await fetch('https://nothelferkurs-zuerich.ch/courses.json');
    const coursesData = await coursesResponse.json();
    const course = coursesData.courses.find(c => c.id === data.courseId);
    
    if (!course) {
      return new Response(JSON.stringify({ error: 'Kurs nicht gefunden' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Formatiere Datum
    const day1Date = new Date(course.day1);
    const day2Date = new Date(course.day2);
    const formatDate = (date) => date.toLocaleDateString('de-CH', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });

    // E-Mail-Text erstellen
    const emailText = `
Guten Tag ${data.firstName} ${data.lastName},

vielen Dank für Ihre Buchung des Nothelferkurses in Zürich!

Ihre Buchungsdetails:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Kursdaten:
• Tag 1: ${formatDate(day1Date)}, ${course.day1Time} Uhr
• Tag 2: ${formatDate(day2Date)}, ${course.day2Time} Uhr
  (inkl. 1 Stunde Mittagspause)

Standort:
${course.location}

Instruktor:
${course.instructor}

Kursgebühr:
CHF ${course.price}.-

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎁 CHF 50.- Cashback auf DriveLab Wallet

Nach Abschluss des Kurses erhalten Sie CHF 50.- Cashback auf Ihr DriveLab Wallet gutgeschrieben.

Für die Zahlung und Aktivierung des Cashbacks besuchen Sie bitte:
👉 https://drivelab.ch/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Was Sie mitbringen müssen:
✓ Gültiger Ausweis (ID oder Pass)
✓ Gute Laune und Lernbereitschaft

Alle Kursmaterialien werden zur Verfügung gestellt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Anfahrt:
Die PH Zürich ist optimal mit öffentlichen Verkehrsmitteln erreichbar:
• Tram: Linien 2, 3, 4, 13, 14 (Haltestelle "Sihlquai/HB")
• Bus: Linien 31, 33 (Haltestelle "Sihlquai/HB")
• Zu Fuss: 5 Minuten vom Hauptbahnhof Zürich

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Wichtige Hinweise:
• Bitte erscheinen Sie pünktlich zum Kursbeginn
• Bei Verspätung oder Nichterscheinen kann keine Kursbestätigung ausgestellt werden
• Stornierungen sind bis 6 Tage vor Kursbeginn kostenlos möglich

24 Stunden vor Kursbeginn erhalten Sie eine Erinnerungs-E-Mail.

Bei Fragen stehen wir Ihnen gerne zur Verfügung:
📧 info@drivelab.ch
📞 +41 76 237 13 07

Wir freuen uns auf Sie!

Mit freundlichen Grüssen
Ihr DriveLab Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DriveLab GmbH
Lauriedhofweg 12
CH-6300 Zug
www.drivelab.ch
    `.trim();

    // Mailgun API-Aufruf
    const formData = new FormData();
    formData.append('from', 'Nothelferkurs Zürich <noreply@mg.nothelferkurs-zuerich.ch>');
    formData.append('to', data.email);
    formData.append('subject', `Buchungsbestätigung: Nothelferkurs ${formatDate(day1Date)}`);
    formData.append('text', emailText);

    const mailgunResponse = await fetch(
      `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`api:${mailgunApiKey}`)
        },
        body: formData
      }
    );

    if (!mailgunResponse.ok) {
      const errorText = await mailgunResponse.text();
      console.error('Mailgun error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'E-Mail konnte nicht gesendet werden',
        details: errorText 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Erfolgreiche Antwort
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Buchung erfolgreich! Sie erhalten in Kürze eine Bestätigungs-E-Mail.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Booking error:', error);
    return new Response(JSON.stringify({ 
      error: 'Ein Fehler ist aufgetreten',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
