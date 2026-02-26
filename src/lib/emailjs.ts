// ─── EmailJS Configuration ─────────────────────────────────────────
const EMAILJS_SERVICE_ID = 'service_zcca94d';
const EMAILJS_TEMPLATE_ID = 'template_2a67db4';
const EMAILJS_PUBLIC_KEY = 'An1IAXkXaKq6th8m4';

/**
 * Send a notification email to the doctor when a patient books an appointment.
 * Uses the EmailJS REST API directly (avoids SDK fetch issues with ad blockers).
 */
export async function sendAppointmentEmail(params: {
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  message: string;
}) {
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_name: params.doctorName,
          to_email: params.doctorEmail,
          patient_name: params.patientName,
          appointment_date: params.date,
          appointment_time: params.time,
          appointment_duration: `${params.duration} minutes`,
          patient_message: params.message || 'No message provided',
        },
      }),
    });

    if (response.ok) {
      console.log('[HealthConnect] Appointment email sent to', params.doctorEmail);
    } else {
      const text = await response.text();
      console.error('[HealthConnect] EmailJS responded with error:', text);
    }
  } catch (error) {
    console.error('[HealthConnect] Failed to send appointment email:', error);
    // Don't throw — email failure shouldn't block the booking
  }
}
