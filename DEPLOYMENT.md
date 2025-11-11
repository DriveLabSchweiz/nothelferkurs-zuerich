# Deployment-Anleitung für nothelferkurs-zuerich.ch

Diese Anleitung beschreibt Schritt für Schritt, wie die Website auf Cloudflare Pages deployed wird.

## Voraussetzungen

- Cloudflare-Account
- Domain `nothelferkurs-zuerich.ch` in Cloudflare
- Mailgun-Account mit konfigurierter Domain `mg.nothelferkurs-zuerich.ch`
- Node.js und pnpm installiert

## Schritt 1: Repository vorbereiten

```bash
cd nothelferkurs-zuerich-new
git init
git add .
git commit -m "Initial commit"
```

## Schritt 2: GitHub Repository erstellen (optional aber empfohlen)

```bash
# GitHub Repository erstellen über gh CLI
gh repo create nothelferkurs-zuerich --public --source=. --remote=origin --push
```

## Schritt 3: Cloudflare D1 Datenbank erstellen

```bash
# Wrangler installieren (falls noch nicht vorhanden)
pnpm add -g wrangler

# Bei Cloudflare anmelden
wrangler login

# D1 Datenbank erstellen
wrangler d1 create nothelferkurs-db
```

**Wichtig**: Notiere die Database ID aus der Ausgabe!

Beispiel-Ausgabe:
```
✅ Successfully created DB 'nothelferkurs-db'

[[d1_databases]]
binding = "DB"
database_name = "nothelferkurs-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## Schritt 4: wrangler.toml aktualisieren

Öffne `wrangler.toml` und ersetze `YOUR_D1_DATABASE_ID` mit der erhaltenen Database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "nothelferkurs-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # Hier deine ID eintragen
```

## Schritt 5: Datenbank-Schema initialisieren

```bash
# Schema in D1 importieren
wrangler d1 execute nothelferkurs-db --file=./schema.sql
```

Überprüfe, ob die Daten korrekt importiert wurden:

```bash
wrangler d1 execute nothelferkurs-db --command="SELECT COUNT(*) FROM courses"
```

Erwartete Ausgabe: `8` (8 Kurse)

## Schritt 6: Cloudflare Pages Projekt erstellen

### Option A: Via Cloudflare Dashboard (empfohlen)

1. Gehe zu [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Wähle deinen Account
3. Navigiere zu **Workers & Pages**
4. Klicke auf **Create application**
5. Wähle **Pages** → **Connect to Git**
6. Verbinde dein GitHub Repository
7. Konfiguriere das Projekt:
   - **Project name**: `nothelferkurs-zuerich`
   - **Production branch**: `main`
   - **Build command**: `pnpm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`

### Option B: Via CLI

```bash
# Pages Projekt erstellen
wrangler pages project create nothelferkurs-zuerich

# Erstes Deployment
pnpm run build
wrangler pages deploy dist --project-name=nothelferkurs-zuerich
```

## Schritt 7: Umgebungsvariablen konfigurieren

Im Cloudflare Dashboard:

1. Gehe zu **Workers & Pages** → **nothelferkurs-zuerich**
2. Klicke auf **Settings** → **Environment variables**
3. Füge folgende Variablen hinzu (für Production):

| Variable Name | Value |
|--------------|-------|
| `MAILGUN_API_KEY` | `02300200-6d1542e2` |
| `MAILGUN_DOMAIN` | `mg.nothelferkurs-zuerich.ch` |

## Schritt 8: D1 Binding hinzufügen

Im Cloudflare Dashboard:

1. Gehe zu **Workers & Pages** → **nothelferkurs-zuerich**
2. Klicke auf **Settings** → **Functions**
3. Scrolle zu **D1 database bindings**
4. Klicke auf **Add binding**
5. Konfiguriere:
   - **Variable name**: `DB`
   - **D1 database**: `nothelferkurs-db`
6. Klicke auf **Save**

## Schritt 9: Custom Domain hinzufügen

Im Cloudflare Dashboard:

1. Gehe zu **Workers & Pages** → **nothelferkurs-zuerich**
2. Klicke auf **Custom domains**
3. Klicke auf **Set up a custom domain**
4. Gib `nothelferkurs-zuerich.ch` ein
5. Cloudflare konfiguriert automatisch die DNS-Einträge
6. Füge optional auch `www.nothelferkurs-zuerich.ch` hinzu

## Schritt 10: Cron Trigger für Erinnerungsmails einrichten

Im Cloudflare Dashboard:

1. Gehe zu **Workers & Pages** → **nothelferkurs-zuerich**
2. Klicke auf **Settings** → **Triggers**
3. Scrolle zu **Cron Triggers**
4. Klicke auf **Add Cron Trigger**
5. Konfiguriere:
   - **Cron expression**: `0 * * * *` (jede Stunde)
   - **Route**: `/scheduled`
6. Klicke auf **Save**

## Schritt 11: Mailgun DNS-Einträge konfigurieren

In deinem Mailgun-Dashboard:

1. Gehe zu **Sending** → **Domains**
2. Wähle `mg.nothelferkurs-zuerich.ch`
3. Kopiere die DNS-Einträge (TXT, MX, CNAME)

In Cloudflare DNS:

1. Gehe zu **Websites** → `nothelferkurs-zuerich.ch` → **DNS**
2. Füge alle Mailgun-DNS-Einträge hinzu:
   - **TXT-Records** für SPF und DKIM
   - **MX-Records** für E-Mail-Empfang
   - **CNAME-Record** für Tracking

**Wichtig**: Deaktiviere den Cloudflare-Proxy (orange Cloud) für Mailgun-Einträge!

## Schritt 12: Deployment testen

### Website testen
Öffne https://nothelferkurs-zuerich.ch und überprüfe:
- ✅ Homepage lädt korrekt
- ✅ Kursliste wird angezeigt
- ✅ Sprachumschaltung funktioniert (DE/EN)
- ✅ Alle Seiten sind erreichbar
- ✅ Bilder werden geladen

### Buchungssystem testen
1. Gehe zu https://nothelferkurs-zuerich.ch/courses
2. Fülle das Buchungsformular aus (mit Test-E-Mail)
3. Überprüfe:
   - ✅ Buchung wird in D1 gespeichert
   - ✅ Bestätigungs-E-Mail wird versendet
   - ✅ Erinnerungs-E-Mail wird in email_queue eingetragen

### Datenbank überprüfen
```bash
# Alle Buchungen anzeigen
wrangler d1 execute nothelferkurs-db --command="SELECT * FROM bookings"

# Email-Queue anzeigen
wrangler d1 execute nothelferkurs-db --command="SELECT * FROM email_queue"
```

### E-Mail-Versand testen
```bash
# Scheduled Worker manuell triggern
curl https://nothelferkurs-zuerich.ch/scheduled
```

## Schritt 13: Monitoring einrichten

### Cloudflare Analytics
1. Gehe zu **Workers & Pages** → **nothelferkurs-zuerich** → **Analytics**
2. Überwache:
   - Requests
   - Errors
   - CPU Time
   - Bandwidth

### Mailgun Logs
1. Gehe zu Mailgun Dashboard → **Logs**
2. Überwache E-Mail-Versand und Fehler

## Troubleshooting

### Problem: Buchungsformular funktioniert nicht
**Lösung**: Überprüfe D1 Binding und Umgebungsvariablen

```bash
# D1 Binding testen
wrangler pages deployment tail --project-name=nothelferkurs-zuerich
```

### Problem: E-Mails werden nicht versendet
**Lösung**: 
1. Überprüfe Mailgun API-Key
2. Überprüfe DNS-Einträge in Cloudflare
3. Überprüfe Mailgun-Logs

### Problem: Cron Trigger funktioniert nicht
**Lösung**:
1. Überprüfe Cron-Konfiguration im Dashboard
2. Teste manuell: `curl https://nothelferkurs-zuerich.ch/scheduled`
3. Überprüfe Logs: `wrangler pages deployment tail`

### Problem: 404-Fehler bei Unterseiten
**Lösung**: Cloudflare Pages sollte automatisch SPA-Routing unterstützen. Falls nicht:
1. Erstelle `_redirects` Datei in `public/`:
```
/*    /index.html   200
```

## Wartung

### Kursdaten aktualisieren
1. Bearbeite `src/data/courses.json`
2. Commit und push zu GitHub
3. Cloudflare Pages deployed automatisch

### Neue Kurse in Datenbank hinzufügen
```bash
wrangler d1 execute nothelferkurs-db --command="
INSERT INTO courses (id, start_date, end_date, day1, day2, day1_time, day2_time, price, currency, location, max_participants, current_participants, instructor, language)
VALUES ('apr-2026-1', '2026-04-10T18:00:00+01:00', '2026-04-11T17:00:00+01:00', '2026-04-10', '2026-04-11', '18:00-21:00', '09:00-17:00', 120, 'CHF', 'PH Zürich, Lagerstrasse 2, 8004 Zürich', 20, 0, 'Julian Borner', 'de')
"
```

### Logs anzeigen
```bash
# Real-time Logs
wrangler pages deployment tail --project-name=nothelferkurs-zuerich

# Letzte Deployments anzeigen
wrangler pages deployment list --project-name=nothelferkurs-zuerich
```

## Backup

### Datenbank-Backup erstellen
```bash
# Alle Tabellen exportieren
wrangler d1 execute nothelferkurs-db --command="SELECT * FROM courses" --json > backup_courses.json
wrangler d1 execute nothelferkurs-db --command="SELECT * FROM bookings" --json > backup_bookings.json
wrangler d1 execute nothelferkurs-db --command="SELECT * FROM email_queue" --json > backup_email_queue.json
```

## Support

Bei Fragen oder Problemen:
- E-Mail: info@drivelab.ch
- Telefon: +41 76 237 13 07
- Cloudflare Support: https://support.cloudflare.com/
- Mailgun Support: https://help.mailgun.com/

## Nächste Schritte

- [ ] SSL-Zertifikat überprüfen (automatisch von Cloudflare)
- [ ] Google Search Console einrichten
- [ ] Analytics einrichten (z.B. Plausible, Umami)
- [ ] Regelmässige Backups automatisieren
- [ ] Performance-Monitoring einrichten
