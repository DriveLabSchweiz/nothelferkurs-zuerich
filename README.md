# Nothelferkurs Zürich - Website

Offiziell anerkannte Nothelferkurse in Zürich, betrieben von DriveLab GmbH.

## 🚀 Technologie-Stack

- **Frontend**: Astro.js (Static Site Generation)
- **Styling**: Tailwind CSS
- **Interaktivität**: React (für Buchungsformular)
- **Backend**: Cloudflare Workers (Serverless Functions)
- **Datenbank**: Cloudflare D1 (SQLite)
- **E-Mail**: Mailgun API
- **Hosting**: Cloudflare Pages

## 📋 Features

- ✅ Vollständig statische Website (SSG) für maximale Performance
- ✅ Mehrsprachigkeit (Deutsch & Englisch)
- ✅ SEO-optimiert mit Rich Snippets (JSON-LD)
- ✅ Responsive Design
- ✅ Buchungssystem mit Datenbank
- ✅ Automatische Bestätigungs-E-Mails via Mailgun
- ✅ Erinnerungs-E-Mails 24h vor Kursbeginn
- ✅ iframe-Einbettung für externe Websites
- ✅ Moderne Bildformate (WebP)
- ✅ robots.txt, sitemap.xml, llms.txt

## 🛠️ Installation

```bash
# Dependencies installieren
pnpm install

# Entwicklungsserver starten
pnpm run dev

# Für Produktion bauen
pnpm run build

# Build-Vorschau
pnpm run preview
```

## 📦 Deployment auf Cloudflare Pages

### 1. Cloudflare D1 Datenbank erstellen

```bash
# D1 Datenbank erstellen
npx wrangler d1 create nothelferkurs-db

# Database ID in wrangler.toml eintragen
# Ersetze YOUR_D1_DATABASE_ID mit der erhaltenen ID
```

### 2. Datenbank-Schema initialisieren

```bash
# Schema in D1 importieren
npx wrangler d1 execute nothelferkurs-db --file=./schema.sql
```

### 3. Cloudflare Pages Projekt erstellen

```bash
# Mit Cloudflare verbinden
npx wrangler login

# Pages Projekt erstellen
npx wrangler pages project create nothelferkurs-zuerich
```

### 4. Umgebungsvariablen setzen

Im Cloudflare Dashboard unter Pages → Settings → Environment variables:

- `MAILGUN_API_KEY`: `02300200-6d1542e2`
- `MAILGUN_DOMAIN`: `mg.nothelferkurs-zuerich.ch`

### 5. D1 Binding hinzufügen

Im Cloudflare Dashboard unter Pages → Settings → Functions:
- Binding name: `DB`
- D1 database: `nothelferkurs-db`

### 6. Deployment

```bash
# Manuelles Deployment
pnpm run build
npx wrangler pages deploy dist

# Oder via Git (empfohlen)
git push origin main
```

### 7. Cron Trigger für Erinnerungsmails einrichten

Im Cloudflare Dashboard unter Workers & Pages → Cron Triggers:
- Schedule: `0 * * * *` (jede Stunde)
- Endpoint: `/scheduled`

## 🗄️ Datenbank-Schema

Die Datenbank enthält drei Tabellen:

1. **courses**: Kursinformationen (Termine, Preise, Instruktoren)
2. **bookings**: Buchungen der Teilnehmer
3. **email_queue**: Warteschlange für geplante E-Mails

## 📧 E-Mail-Integration

### Bestätigungs-E-Mail
Wird automatisch nach erfolgreicher Buchung versendet mit:
- Kursdetails
- Zahlungslink mit Cashback-Information
- Stornierungsbedingungen

### Erinnerungs-E-Mail
Wird 24 Stunden vor Kursbeginn automatisch versendet mit:
- Kurserinnerung
- Standortinformationen
- Wichtige Hinweise

## 🔗 iframe-Einbettung

Die Kursliste kann auf externen Websites eingebettet werden:

```html
<iframe 
  src="https://nothelferkurs-zuerich.ch/embed?lang=de" 
  width="100%" 
  height="800" 
  frameborder="0" 
  style="border: none; overflow: hidden;"
  title="Nothelferkurs Zürich - Kursliste">
</iframe>
```

## 🌐 DNS-Konfiguration

### Cloudflare DNS-Einträge

Für die Domain `nothelferkurs-zuerich.ch`:

1. **A-Record** (Root Domain):
   - Name: `@`
   - Content: Cloudflare Pages IP (automatisch)
   - Proxy: ✅ Aktiviert

2. **CNAME-Record** (WWW):
   - Name: `www`
   - Content: `nothelferkurs-zuerich.pages.dev`
   - Proxy: ✅ Aktiviert

3. **CNAME-Record** (Mailgun):
   - Name: `mg`
   - Content: `mailgun.org`
   - Proxy: ❌ Deaktiviert

4. **MX-Records** (Mailgun):
   - Priority: 10
   - Content: `mxa.eu.mailgun.org`
   - Priority: 10
   - Content: `mxb.eu.mailgun.org`

5. **TXT-Records** (Mailgun SPF/DKIM):
   - Gemäss Mailgun-Dashboard konfigurieren

## 📊 SEO-Optimierung

- ✅ Meta-Tags (Title, Description, Keywords)
- ✅ Open Graph Tags (Facebook, Twitter)
- ✅ Canonical URLs
- ✅ Hreflang-Tags für Mehrsprachigkeit
- ✅ Strukturierte Daten (JSON-LD) für Kurse
- ✅ Sitemap.xml (automatisch generiert)
- ✅ robots.txt
- ✅ llms.txt für LLM-Optimierung
- ✅ Optimierte Bilder (WebP)
- ✅ Semantisches HTML
- ✅ Interne Verlinkung

## 📱 Responsive Design

Die Website ist vollständig responsive und optimiert für:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔐 Sicherheit

- HTTPS erzwungen
- CORS-Header konfiguriert
- Input-Validierung im Buchungsformular
- SQL-Injection-Schutz durch Prepared Statements
- XSS-Schutz durch React

## 📞 Support

Bei Fragen oder Problemen:
- E-Mail: info@drivelab.ch
- Telefon: +41 76 237 13 07

## 📄 Lizenz

© 2025 DriveLab GmbH. Alle Rechte vorbehalten.
