# HealthConnect — Medical Appointment Booking System

A modern medical appointment booking platform built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**. Patients can browse doctors, book appointments, and chat — while doctors manage their availability and receive email notifications.

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-blue) ![Supabase](https://img.shields.io/badge/Supabase-Backend-green) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![AWS EC2](https://img.shields.io/badge/Amazon_EC2-Hosting-orange)

**🚀 Live Demo:** [http://54.226.148.209/](http://54.226.148.209/)

---

## ✨ Features

### 🧑‍⚕️ Patient
- Browse available doctors and their specializations
- Book appointments from available time slots
- Send messages to doctors via real-time chat
- Sign in with Google OAuth or email/password
- Receive email verification on registration

### 🩺 Doctor
- Register with specialization details (email/password only)
- Add and manage available time slots
- View booked appointments
- Chat with patients
- Receive email notifications when a patient books an appointment

### 🔐 Admin
- View dashboard with stats (doctors, patients, appointments)
- Add or delete doctors and patients
- Full user management with Supabase Auth cleanup (RPC) avoiding zombie profiles
- Handling of user re-registration: Users deleted by an admin can seamlessly re-register using their original credentials
- Admin credentials: `admin@admin.com` / `admin123`

### 🌐 General
- Google OAuth sign-in for both patients and doctors (caches role selection before redirect)
- Role-based dashboards (Admin / Doctor / Patient)
- Real-time toast notifications
- Responsive design (mobile-friendly)
- Email notifications via EmailJS

---

## 🛠 Tech Stack

| Layer      | Technology                      |
|------------|---------------------------------|
| Frontend   | React 19, TypeScript, Vite 7    |
| Styling    | Tailwind CSS v4                 |
| Backend    | Supabase (Auth, Database, API)  |
| Email      | EmailJS (REST API)              |
| Icons      | Lucide React                    |
| Hosting    | Amazon EC2                      |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- An [EmailJS](https://www.emailjs.com) account (free — 200 emails/month)

### Installation

```bash
git clone <repo-url>
cd healthconnect
npm install
npm run dev
```

The app will be available at `http://localhost:5173/`.

---

## 🗄 Supabase Setup

### 1. Create Tables

Run the following SQL in your Supabase **SQL Editor**:

```sql
-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  username TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'patient')),
  subject TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Slots
CREATE TABLE IF NOT EXISTS slots (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  duration INT NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  slot_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  duration INT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Enable User Deletion (for Admin)

This function allows the admin to fully delete users (both profile and auth):

```sql
CREATE OR REPLACE FUNCTION delete_user_by_id(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;
```

### 3. Row Level Security

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON slots FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON appointments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON messages FOR ALL USING (true) WITH CHECK (true);
```

### 4. Create Admin Account

Go to **Authentication → Users** in your Supabase dashboard and create a user:
- Email: `admin@admin.com`
- Password: `admin123`

### 5. Update Configuration

Update the Supabase URL and anon key in `src/lib/supabase.ts`:

```typescript
const SUPABASE_URL = 'https://<your-project-id>.supabase.co';
const SUPABASE_ANON_KEY = '<your-anon-key>';
```

---

## 📧 EmailJS Setup

1. Sign up at [emailjs.com](https://www.emailjs.com/)
2. **Add an Email Service** (Gmail, Outlook, etc.) → copy the **Service ID**
3. **Create an Email Template** with these fields:
   - **To Email**: `{{to_email}}`
   - **From Name**: `HealthConnect`
   - **Subject**: `New Appointment Booking — HealthConnect`
   - **Body**:
     ```
     Hi {{to_name}},

     You have a new appointment booking!

     Patient: {{patient_name}}
     Date: {{appointment_date}}
     Time: {{appointment_time}}
     Duration: {{appointment_duration}}
     Message: {{patient_message}}

     — HealthConnect
     ```
   - Copy the **Template ID**
4. Go to **Account → General** → copy your **Public Key**
5. Update `src/lib/emailjs.ts` with your three credentials

---

## 🔑 Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → **APIs & Services → Credentials → Create OAuth Client ID**
3. Set **Authorized redirect URI** to: `https://<your-supabase-id>.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret**
5. In Supabase Dashboard → **Authentication → Providers → Google** → paste credentials and enable

> **Note:** Google OAuth supports both **patient and doctor** registration. Users select their desired role (and specialization, if applicable) prior to clicking the Google button. The application temporarily caches this selection and creates the proper profile upon successful return from Google.

---

## 📂 Project Structure

```
healthconnect/
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx    # Admin panel (stats, user management)
│   │   ├── AuthContainer.tsx     # Login / Register / Google OAuth
│   │   ├── ChatPanel.tsx         # Doctor ↔ Patient messaging
│   │   ├── DoctorDashboard.tsx   # Doctor panel (slots, appointments)
│   │   ├── Modal.tsx             # Reusable modal component
│   │   ├── Notification.tsx      # Toast notifications
│   │   ├── PatientDashboard.tsx  # Patient panel (browse, book)
│   │   └── StatCard.tsx          # Dashboard stat card
│   ├── context/
│   │   └── AppContext.tsx        # Global state & Supabase logic
│   ├── lib/
│   │   ├── emailjs.ts           # Email notification helper
│   │   └── supabase.ts          # Supabase client config
│   ├── types.ts                 # TypeScript interfaces
│   ├── App.tsx                  # Root component with role routing
│   ├── main.tsx                 # Entry point
│   └── index.css                # Tailwind + custom theme
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔀 How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Patient    │     │   Doctor    │     │    Admin    │
│  Dashboard   │     │  Dashboard  │     │  Dashboard  │
└──────┬───────┘     └──────┬──────┘     └──────┬──────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────┐
│                  AppContext (State)                    │
│  • Auth (login, register, Google OAuth)               │
│  • CRUD (doctors, patients, slots, appointments)      │
│  • Messaging (doctor ↔ patient chat)                  │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                    Supabase                           │
│  • Auth (users, sessions, Google OAuth)               │
│  • Database (profiles, slots, appointments, messages) │
│  • RPC (delete_user_by_id)                            │
└──────────────────────────────────────────────────────┘
```

---

## 👤 Default Admin Login

| Email             | Password   |
|-------------------|------------|
| admin@admin.com   | admin123   |

---

## 📝 Available Scripts

| Command          | Description                    |
|------------------|--------------------------------|
| `npm run dev`    | Start development server       |
| `npm run build`  | Build for production           |
| `npm run lint`   | Run ESLint                     |
| `npm run preview`| Preview production build       |

---

## 📄 License

MIT
