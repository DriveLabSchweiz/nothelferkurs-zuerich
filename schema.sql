-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  day1 TEXT NOT NULL,
  day2 TEXT NOT NULL,
  day1_time TEXT NOT NULL,
  day2_time TEXT NOT NULL,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CHF',
  location TEXT NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 20,
  current_participants INTEGER NOT NULL DEFAULT 0,
  instructor TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'de',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Email queue table for scheduled emails
CREATE TABLE IF NOT EXISTS email_queue (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  email_type TEXT NOT NULL,
  scheduled_for TEXT NOT NULL,
  sent_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Insert initial course data
INSERT INTO courses (id, start_date, end_date, day1, day2, day1_time, day2_time, price, currency, location, max_participants, current_participants, instructor, language)
VALUES 
  ('nov-2025', '2025-11-28T18:00:00+01:00', '2025-11-29T17:00:00+01:00', '2025-11-28', '2025-11-29', '18:00-21:00', '09:00-17:00', 120, 'CHF', 'PH Zürich, Lagerstrasse 2, 8004 Zürich', 20, 0, 'Julian Borner', 'de'),
  ('dec-2025', '2025-12-12T18:00:00+01:00', '2025-12-13T17:00:00+01:00', '2025-12-12', '2025-12-13', '18:00-21:00', '09:00-17:00', 120, 'CHF', 'PH Zürich, Lagerstrasse 2, 8004 Zürich', 20, 0, 'Vladimir Lepak', 'de'),
  ('jan-2026-1', '2026-01-16T18:00:00+01:00', '2026-01-17T17:00:00+01:00', '2026-01-16', '2026-01-17', '18:00-21:00', '09:00-17:00', 120, 'CHF', 'PH Zürich, Lagerstrasse 2, 8004 Zürich', 20, 0, 'Julian Borner', 'de'),
  ('jan-2026-2', '2026-01-30T18:00:00+01:00', '2026-01-31T17:00:00+01:00', '2026-01-30', '2026-01-31', '18:00-21:00', '09:00-17:00', 120, 'CHF', 'PH Zürich, Lagerstrasse 2, 8004 Zürich', 20, 0, 'Vladimir Lepak', 'de'),
  ('feb-2026-1', '2026-02-13T18:00:00+01:00', '2026-02-14T17:00:00+01:00', '2026-02-13', '2026-02-14', '18:00-21:00', '09:00-17:00', 120, 'CHF', 'PH Zürich, Lagerstrasse 2, 8004 Zürich', 20, 0, 'Julian Borner', 'de'),
  ('feb-2026-2', '2026-02-27T18:00:00+01:00', '2026-02-28T17:00:00+01:00', '2026-02-27', '2026-02-28', '18:00-21:00', '09:00-17:00', 120, 'CHF', 'PH Zürich, Lagerstrasse 2, 8004 Zürich', 20, 0, 'Vladimir Lepak', 'de'),
  ('mar-2026-1', '2026-03-13T18:00:00+01:00', '2026-03-14T17:00:00+01:00', '2026-03-13', '2026-03-14', '18:00-21:00', '09:00-17:00', 120, 'CHF', 'PH Zürich, Lagerstrasse 2, 8004 Zürich', 20, 0, 'Julian Borner', 'de'),
  ('mar-2026-2', '2026-03-27T18:00:00+01:00', '2026-03-28T17:00:00+01:00', '2026-03-27', '2026-03-28', '18:00-21:00', '09:00-17:00', 120, 'CHF', 'PH Zürich, Lagerstrasse 2, 8004 Zürich', 20, 0, 'Vladimir Lepak', 'de');
