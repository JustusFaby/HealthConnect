import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase, ADMIN_CREDENTIALS } from '../lib/supabase';
import { sendAppointmentEmail } from '../lib/emailjs';
import type {
  Doctor,
  Patient,
  Slot,
  Appointment,
  Message,
  CurrentUser,
  UserRole,
} from '../types';

/* ------------------------------------------------------------------ */
/*  Notification                                                       */
/* ------------------------------------------------------------------ */
interface Notification {
  message: string;
  type: 'success' | 'error';
}

/* ------------------------------------------------------------------ */
/*  Context value                                                      */
/* ------------------------------------------------------------------ */
interface AppContextValue {
  // auth
  currentUser: CurrentUser | null;
  currentRole: UserRole;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: 'doctor' | 'patient',
    subject?: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // data
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  slots: Slot[];
  messages: Message[];
  refreshData: () => Promise<void>;

  // admin actions
  addDoctor: (
    name: string,
    username: string,
    email: string,
    subject: string,
    password: string
  ) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;

  // doctor actions
  addSlot: (date: string, time: string, duration: number) => Promise<void>;
  deleteSlot: (id: string) => Promise<void>;

  // patient actions
  bookAppointment: (
    doctor: Doctor,
    slot: Slot,
    message: string
  ) => Promise<void>;

  // messaging
  sendMessage: (
    receiverId: string,
    receiverName: string,
    content: string
  ) => Promise<void>;

  // notifications
  notification: Notification | null;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */
export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [notification, setNotification] = useState<Notification | null>(null);

  /* ---- helpers --------------------------------------------------- */
  const showNotification = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
    },
    []
  );

  const generateId = () =>
    Date.now() + Math.random().toString(36).substring(2, 11);

  /* ---- data loading ---------------------------------------------- */
  const loadData = useCallback(async () => {
    try {
      const [
        { data: doctorData },
        { data: patientData },
        { data: appointmentData },
        { data: slotData },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'doctor'),
        supabase
          .from('profiles')
          .select('*')
          .eq('role', 'patient'),
        supabase.from('appointments').select('*'),
        supabase.from('slots').select('*'),
      ]);

      // Load messages separately so it doesn't block if table is missing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let messageData: any[] | null = null;
      try {
        const res = await supabase.from('messages').select('*');
        messageData = res.data;
      } catch {
        // messages table may not exist yet
      }

      setDoctors(
        (doctorData || []).map((t) => ({
          id: t.id,
          name: t.name,
          email: t.email,
          subject: t.subject || '',
          role: t.role,
        }))
      );
      setPatients(
        (patientData || []).map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          role: s.role,
        }))
      );
      setAppointments(
        (appointmentData || []).map((a) => ({
          id: a.id,
          patientId: a.patient_id,
          doctorId: a.doctor_id,
          slotId: a.slot_id,
          patientName: a.patient_name,
          doctorName: a.doctor_name,
          date: a.date,
          time: a.time,
          duration: a.duration,
          message: a.message,
          status: a.status,
          createdAt: a.created_at,
        }))
      );
      setSlots(
        (slotData || []).map((s) => ({
          id: s.id,
          doctorId: s.doctor_id,
          date: s.date,
          time: s.time,
          duration: s.duration,
          isBooked: s.is_booked,
          createdAt: s.created_at,
        }))
      );
      setMessages(
        (messageData || []).map((m) => ({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          senderRole: m.sender_role,
          receiverId: m.receiver_id,
          receiverName: m.receiver_name,
          content: m.content,
          createdAt: m.created_at,
        }))
      );
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, []);

  /* ---- upsert helper -------------------------------------------- */
  async function upsertTable(
    tableName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataArray: Record<string, any>[]
  ) {
    if (dataArray.length === 0) {
      await supabase.from(tableName).delete().neq('id', '');
      return;
    }
    const currentIds = dataArray.map((item) => item.id);
    await supabase
      .from(tableName)
      .delete()
      .not('id', 'in', `(${currentIds.join(',')})`);
    const { error } = await supabase
      .from(tableName)
      .upsert(dataArray, { onConflict: 'id' });
    if (error) throw error;
  }

  async function saveData(
    appts: Appointment[],
    sl: Slot[],
    msgs: Message[]
  ) {
    await Promise.all([
      upsertTable(
        'appointments',
        appts.map((a) => ({
          id: a.id,
          patient_id: a.patientId,
          doctor_id: a.doctorId,
          slot_id: a.slotId,
          patient_name: a.patientName,
          doctor_name: a.doctorName,
          date: a.date,
          time: a.time,
          duration: a.duration,
          message: a.message,
          status: a.status,
          created_at: a.createdAt,
        }))
      ),
      upsertTable(
        'slots',
        sl.map((s) => ({
          id: s.id,
          doctor_id: s.doctorId,
          date: s.date,
          time: s.time,
          duration: s.duration,
          is_booked: s.isBooked,
          created_at: s.createdAt,
        }))
      ),
      upsertTable(
        'messages',
        msgs.map((m) => ({
          id: m.id,
          sender_id: m.senderId,
          sender_name: m.senderName,
          sender_role: m.senderRole,
          receiver_id: m.receiverId,
          receiver_name: m.receiverName,
          content: m.content,
          created_at: m.createdAt,
        }))
      ),
    ]);
  }

  /* ---- route user ------------------------------------------------ */
  const routeUser = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (session: any) => {
      if (!session?.user) {
        setCurrentUser(null);
        setCurrentRole(null);
        return;
      }
      const user = session.user;

      if (user.email === ADMIN_CREDENTIALS.email) {
        setCurrentUser({ id: user.id, email: user.email, role: 'admin' });
        setCurrentRole('admin');
        loadData(); // don't await — load in background
        showNotification('Welcome, Admin!');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Read any role the user selected before the OAuth redirect
      const savedRole = localStorage.getItem('hc_oauth_role') as 'doctor' | 'patient' | null;
      const savedSubject = localStorage.getItem('hc_oauth_subject');
      // Clean up localStorage
      localStorage.removeItem('hc_oauth_role');
      localStorage.removeItem('hc_oauth_subject');

      if (!profile) {
        // Only auto-create a profile if the user just came from the Register tab
        // (indicated by hc_oauth_role in localStorage). Otherwise, this user's
        // profile was deleted by admin — deny access.
        if (!savedRole) {
          showNotification('Account not found. Please register first.', 'error');
          await supabase.auth.signOut();
          setCurrentUser(null);
          setCurrentRole(null);
          return;
        }

        const userName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'User';

        const oauthRole: 'doctor' | 'patient' = savedRole === 'doctor' ? 'doctor' : 'patient';

        const profileData: Record<string, unknown> = {
          id: user.id,
          name: userName,
          email: user.email,
          role: oauthRole,
          status: 'approved',
          created_at: new Date().toISOString(),
        };
        if (oauthRole === 'doctor' && savedSubject) {
          profileData.subject = savedSubject;
        }

        const { error: createError } = await supabase.from('profiles').upsert(profileData);
        if (createError) {
          showNotification('Failed to create profile.', 'error');
          await supabase.auth.signOut();
          return;
        }

        if (oauthRole === 'doctor') {
          setCurrentUser({
            id: user.id,
            name: userName,
            email: user.email!,
            subject: savedSubject || '',
            role: 'doctor',
          });
          setCurrentRole('doctor');
          loadData();
          showNotification(`Welcome, Dr. ${userName}!`);
        } else {
          setCurrentUser({
            id: user.id,
            name: userName,
            email: user.email!,
            role: 'patient',
          });
          setCurrentRole('patient');
          loadData();
          showNotification(`Welcome, ${userName}!`);
        }
        return;
      }

      // If user registered via Google from the Register tab with a different role,
      // update their existing profile to the newly chosen role.
      if (savedRole && savedRole !== profile.role) {
        const updateData: Record<string, unknown> = { role: savedRole };
        if (savedRole === 'doctor' && savedSubject) {
          updateData.subject = savedSubject;
        }
        await supabase.from('profiles').update(updateData).eq('id', user.id);
        profile.role = savedRole;
        if (savedRole === 'doctor' && savedSubject) {
          profile.subject = savedSubject;
        }
      }

      if (profile.role === 'doctor') {
        setCurrentUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          subject: profile.subject || '',
          role: 'doctor',
        });
        setCurrentRole('doctor');
        loadData();
        showNotification(`Welcome, Dr. ${profile.name}!`);
      } else if (profile.role === 'patient') {
        setCurrentUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: 'patient',
        });
        setCurrentRole('patient');
        loadData();
        showNotification(`Welcome, ${profile.name}!`);
      }
    },
    [loadData, showNotification]
  );

  /* ---- init session --------------------------------------------- */
  useEffect(() => {
    let handled = false;

    // Show login screen quickly — don't wait forever
    setLoading(true);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session && !handled) {
        handled = true;
        await routeUser(session);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth state changes (needed for OAuth redirect)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session && !handled) {
        handled = true;
        await routeUser(session);
        setLoading(false);
      }
    });

    // Failsafe: always stop loading after 3 seconds
    const timer = setTimeout(() => setLoading(false), 3000);

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [routeUser]);

  /* ---- auth actions --------------------------------------------- */
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    await routeUser(data.session);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'doctor' | 'patient',
    subject?: string
  ) => {
    let userId: string;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });

    if (error) {
      // If the auth user already exists (e.g. admin deleted their profile),
      // sign in with the existing credentials and re-create the profile.
      if (error.message?.toLowerCase().includes('already registered') ||
        error.message?.toLowerCase().includes('already been registered')) {
        const { data: loginData, error: loginError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw new Error(
          'An account with this email already exists. Please use your original password to re-register, or contact the admin.'
        );
        if (!loginData.user) throw new Error('Login failed.');
        userId = loginData.user.id;
      } else {
        throw error;
      }
    } else {
      if (!data.user) throw new Error('Registration failed.');
      userId = data.user.id;
    }

    const profileData: Record<string, unknown> = {
      id: userId,
      name,
      email,
      role,
      status: 'approved',
      created_at: new Date().toISOString(),
    };
    if (role === 'doctor' && subject) {
      profileData.subject = subject;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData);
    if (profileError) throw profileError;
    await supabase.auth.signOut();
    showNotification(
      'Registration successful! Check your email to verify your account, then log in.'
    );
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentRole(null);
    showNotification('Logged out successfully');
  };

  /* ---- admin actions -------------------------------------------- */
  const addDoctor = async (
    name: string,
    username: string,
    email: string,
    subject: string,
    password: string
  ) => {
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role: 'doctor' } },
      });
    if (signUpError) throw signUpError;
    if (!signUpData.user) throw new Error('Failed to create account');

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: signUpData.user.id,
      name,
      email,
      username: username || null,
      role: 'doctor',
      subject,
      status: 'approved',
      created_at: new Date().toISOString(),
    });
    if (profileError) throw profileError;

    // restore admin session
    await supabase.auth.signInWithPassword({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
    });
    await loadData();
    showNotification('Doctor added successfully!');
  };

  const deleteDoctor = async (id: string) => {
    // Delete the profile row
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      console.error('deleteDoctor error:', error);
      showNotification(`Failed to delete doctor: ${error.message}`, 'error');
      return;
    }
    // Also delete the Supabase Auth user so they can re-register fresh
    try { await supabase.rpc('delete_user_by_id', { user_id: id }); } catch { /* best effort */ }
    // Clean up their slots and appointments
    const newSlots = slots.filter((s) => s.doctorId !== id);
    const newAppts = appointments.filter((a) => a.doctorId !== id);
    await saveData(newAppts, newSlots, messages);
    await loadData();
    showNotification('Doctor deleted.');
  };

  const deletePatient = async (id: string) => {
    // Delete the profile row
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      console.error('deletePatient error:', error);
      showNotification(`Failed to delete patient: ${error.message}`, 'error');
      return;
    }
    // Also delete the Supabase Auth user so they can re-register fresh
    try { await supabase.rpc('delete_user_by_id', { user_id: id }); } catch { /* best effort */ }
    // Clean up their appointments
    const newAppts = appointments.filter((a) => a.patientId !== id);
    await saveData(newAppts, slots, messages);
    await loadData();
    showNotification('Patient deleted.');
  };

  /* ---- doctor actions ------------------------------------------- */
  const addSlot = async (date: string, time: string, duration: number) => {
    if (!currentUser) return;
    const newSlot: Slot = {
      id: generateId(),
      doctorId: currentUser.id,
      date,
      time,
      duration,
      isBooked: false,
      createdAt: new Date().toISOString(),
    };
    const newSlots = [...slots, newSlot];
    await saveData(appointments, newSlots, messages);
    await loadData();
    showNotification('Time slot added!');
  };

  const deleteSlotAction = async (id: string) => {
    const newSlots = slots.filter((s) => s.id !== id);
    await saveData(appointments, newSlots, messages);
    await loadData();
    showNotification('Slot deleted.');
  };

  /* ---- messaging ------------------------------------------------ */
  const sendMessageAction = async (
    receiverId: string,
    receiverName: string,
    content: string
  ) => {
    if (!currentUser) return;
    const newMsg: Message = {
      id: generateId(),
      senderId: currentUser.id,
      senderName: currentUser.name || currentUser.email,
      senderRole: currentRole as 'doctor' | 'patient',
      receiverId,
      receiverName,
      content,
      createdAt: new Date().toISOString(),
    };
    const newMessages = [...messages, newMsg];
    await saveData(appointments, slots, newMessages);
    await loadData();
    showNotification('Message sent!');
  };

  /* ---- patient actions ------------------------------------------ */
  const bookAppointmentAction = async (
    doctor: Doctor,
    slot: Slot,
    message: string
  ) => {
    if (!currentUser) return;
    const newAppt: Appointment = {
      id: generateId(),
      patientId: currentUser.id,
      doctorId: doctor.id,
      slotId: slot.id,
      patientName: currentUser.name || '',
      doctorName: doctor.name,
      date: slot.date,
      time: slot.time,
      duration: slot.duration,
      message,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    const updatedSlots = slots.map((s) =>
      s.id === slot.id ? { ...s, isBooked: true } : s
    );
    const newAppts = [...appointments, newAppt];
    await saveData(newAppts, updatedSlots, messages);
    await loadData();
    showNotification('Appointment booked!');

    // Send email notification to the doctor (fire-and-forget)
    sendAppointmentEmail({
      doctorName: doctor.name,
      doctorEmail: doctor.email,
      patientName: currentUser.name || 'A patient',
      date: slot.date,
      time: slot.time,
      duration: slot.duration,
      message,
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        doctors,
        patients,
        appointments,
        slots,
        messages,
        refreshData: loadData,
        addDoctor,
        deleteDoctor,
        deletePatient,
        addSlot,
        deleteSlot: deleteSlotAction,
        bookAppointment: bookAppointmentAction,
        sendMessage: sendMessageAction,
        notification,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
