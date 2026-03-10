# HealthConnect — Medical Appointment Booking System

A modern medical appointment booking platform built with **React**, **TypeScript**, **Tailwind CSS**, and **Firebase**. Patients can browse doctors, book appointments, and chat — while doctors manage their availability and receive email notifications.

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-blue) ![Firebase](https://img.shields.io/badge/Firebase-Backend-orange) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![AWS EC2](https://img.shields.io/badge/Amazon_EC2-Hosting-orange)

**🚀 Live Demo:** [http://54.226.148.209:5173/](http://54.226.148.209:5173/)

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
- Full user management with Firebase Auth cleanup avoiding zombie profiles
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
| Backend    | Firebase (Auth, Firestore, Functions, API) |
| Email      | EmailJS (REST API)              |
| Icons      | Lucide React                    |
| Hosting    | Amazon EC2                      |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Firebase](https://firebase.google.com/) account (free tier works)
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

## 🗄 Firebase Setup

### 1. Create a Firebase Project

- Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
- Add a web app to your project and copy the Firebase config (apiKey, authDomain, etc.).
- Enable **Authentication** providers (Email/Password, Google, etc.) under **Authentication → Sign-in method**.
- Set up Firestore Database under **Firestore Database → Create database**.

### 2. Firestore Data Structure

Design collections similar to Supabase tables, e.g.:
- `profiles` (users, doctors, admins)
- `slots` (doctor availability slots)
- `appointments` (booked appointments)
- `messages` (chat between patients and doctors)

### 3. Configure Firebase in Your App

Update your Firebase config in `src/lib/firebase.ts`:

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
const firebaseConfig = {
  apiKey: '<your-api-key>',
  authDomain: '<your-auth-domain>',
  projectId: '<your-project-id>',
  storageBucket: '<your-storage-bucket>',
  messagingSenderId: '<your-messaging-sender-id>',
  appId: '<your-app-id>',
};
export const app = initializeApp(firebaseConfig);
```

### 4. (Optional) Set Up Firebase Functions

- Use Firebase Cloud Functions for backend logic if needed (e.g., removing users).

### 5. (Optional) Row Security & Rules

- Go to **Firestore Database → Rules** and set rules that match your security needs.

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
3. Set **Authorized redirect URI** as documented in your Firebase authentication provider settings
4. Copy the **Client ID** and **Client Secret**
5. In Firebase Console → **Authentication → Sign-in method → Google** → paste credentials and enable

> **Note:** Google OAuth supports both **patient and doctor** registration. Users select their desired role (and specialization, if applicable) prior to clicking the Google button. The application temporarily caches this selection and creates the correct profile upon successful return from Google.

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
│   │   └── AppContext.tsx        # Global state & Firebase logic
│   ├── lib/
│   │   ├── emailjs.ts           # Email notification helper
│   │   └── firebase.ts          # Firebase client config
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
│                  AppContext (State)                  │
│  • Auth (login, register, Google OAuth)              │
│  • CRUD (doctors, patients, slots, appointments)     │
│  • Messaging (doctor ↔ patient chat)                 │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                    Firebase                          │
│  • Auth (users, sessions, Google OAuth)              │
│  • Firestore (profiles, slots, appointments, messages) │
│  • Functions (remove users, custom logic)            │
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