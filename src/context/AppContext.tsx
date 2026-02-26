import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  db,
  ADMIN_CREDENTIALS,
  firebaseSignIn,
  firebaseSignUp,
  firebaseGoogleSignIn,
  firebaseSignOut,
  onAuthChange,
  profilesRef,
  appointmentsRef,
  slotsRef,
  messagesRef,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  type User,
} from '../lib/firebase';
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
      // Load doctors
      const doctorQuery = query(profilesRef, where('role', '==', 'doctor'));
      const doctorSnapshot = await getDocs(doctorQuery);
      const doctorData = doctorSnapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name,
          email: d.email,
          subject: d.subject || '',
          role: d.role,
        } as Doctor;
      });

      // Load patients
      const patientQuery = query(profilesRef, where('role', '==', 'patient'));
      const patientSnapshot = await getDocs(patientQuery);
      const patientData = patientSnapshot.docs.map((doc) => {
        const p = doc.data();
        return {
          id: doc.id,
          name: p.name,
          email: p.email,
          role: p.role,
        } as Patient;
      });

      // Load appointments
      const appointmentSnapshot = await getDocs(appointmentsRef);
      const appointmentData = appointmentSnapshot.docs.map((doc) => {
        const a = doc.data();
        return {
          id: doc.id,
          patientId: a.patientId,
          doctorId: a.doctorId,
          slotId: a.slotId,
          patientName: a.patientName,
          doctorName: a.doctorName,
          date: a.date,
          time: a.time,
          duration: a.duration,
          message: a.message,
          status: a.status,
          createdAt: a.createdAt,
        } as Appointment;
      });

      // Load slots
      const slotSnapshot = await getDocs(slotsRef);
      const slotData = slotSnapshot.docs.map((doc) => {
        const s = doc.data();
        return {
          id: doc.id,
          doctorId: s.doctorId,
          date: s.date,
          time: s.time,
          duration: s.duration,
          isBooked: s.isBooked,
          createdAt: s.createdAt,
        } as Slot;
      });

      // Load messages
      let messageData: Message[] = [];
      try {
        const messageSnapshot = await getDocs(messagesRef);
        messageData = messageSnapshot.docs.map((doc) => {
          const m = doc.data();
          return {
            id: doc.id,
            senderId: m.senderId,
            senderName: m.senderName,
            senderRole: m.senderRole,
            receiverId: m.receiverId,
            receiverName: m.receiverName,
            content: m.content,
            createdAt: m.createdAt,
          } as Message;
        });
      } catch {
        // messages collection may not exist yet
      }

      setDoctors(doctorData);
      setPatients(patientData);
      setAppointments(appointmentData);
      setSlots(slotData);
      setMessages(messageData);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, []);

  /* ---- route user ------------------------------------------------ */
  const routeUser = useCallback(
    async (user: User | null) => {
      if (!user) {
        setCurrentUser(null);
        setCurrentRole(null);
        return;
      }

      // Check if admin
      if (user.email === ADMIN_CREDENTIALS.email) {
        setCurrentUser({ id: user.uid, email: user.email, role: 'admin' });
        setCurrentRole('admin');
        loadData();
        showNotification('Welcome, Admin!');
        return;
      }

      // Get profile from Firestore
      const profileDoc = await getDoc(doc(db, 'profiles', user.uid));

      // Read any role the user selected before the OAuth redirect
      const savedRole = localStorage.getItem('hc_oauth_role') as 'doctor' | 'patient' | null;
      const savedSubject = localStorage.getItem('hc_oauth_subject');
      // Clean up localStorage
      localStorage.removeItem('hc_oauth_role');
      localStorage.removeItem('hc_oauth_subject');

      if (!profileDoc.exists()) {
        // Only auto-create a profile if the user just came from the Register tab
        if (!savedRole) {
          showNotification('Account not found. Please register first.', 'error');
          await firebaseSignOut();
          setCurrentUser(null);
          setCurrentRole(null);
          return;
        }

        const userName =
          user.displayName ||
          user.email?.split('@')[0] ||
          'User';

        const oauthRole: 'doctor' | 'patient' = savedRole === 'doctor' ? 'doctor' : 'patient';

        const profileData: Record<string, unknown> = {
          id: user.uid,
          name: userName,
          email: user.email,
          role: oauthRole,
          status: 'approved',
          createdAt: new Date().toISOString(),
        };
        if (oauthRole === 'doctor' && savedSubject) {
          profileData.subject = savedSubject;
        }

        await setDoc(doc(db, 'profiles', user.uid), profileData);

        if (oauthRole === 'doctor') {
          setCurrentUser({
            id: user.uid,
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
            id: user.uid,
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

      const profile = profileDoc.data();

      // If user registered via Google from the Register tab with a different role
      if (savedRole && savedRole !== profile.role) {
        const updateData: Record<string, unknown> = { role: savedRole };
        if (savedRole === 'doctor' && savedSubject) {
          updateData.subject = savedSubject;
        }
        await setDoc(doc(db, 'profiles', user.uid), { ...profile, ...updateData });
        profile.role = savedRole;
        if (savedRole === 'doctor' && savedSubject) {
          profile.subject = savedSubject;
        }
      }

      if (profile.role === 'doctor') {
        setCurrentUser({
          id: user.uid,
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
          id: user.uid,
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
    setLoading(true);

    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        await routeUser(user);
      } else {
        setCurrentUser(null);
        setCurrentRole(null);
      }
      setLoading(false);
    });

    // Failsafe: always stop loading after 3 seconds
    const timer = setTimeout(() => setLoading(false), 3000);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [routeUser]);

  /* ---- auth actions --------------------------------------------- */
  const login = async (email: string, password: string) => {
    const result = await firebaseSignIn(email, password);
    await routeUser(result.user);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'doctor' | 'patient',
    subject?: string
  ) => {
    let userId: string;

    try {
      const result = await firebaseSignUp(email, password);
      userId = result.user.uid;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      // If the auth user already exists, try signing in
      if (err.code === 'auth/email-already-in-use') {
        try {
          const loginResult = await firebaseSignIn(email, password);
          userId = loginResult.user.uid;
        } catch {
          throw new Error(
            'An account with this email already exists. Please use your original password to re-register, or contact the admin.'
          );
        }
      } else {
        throw error;
      }
    }

    const profileData: Record<string, unknown> = {
      id: userId,
      name,
      email,
      role,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    if (role === 'doctor' && subject) {
      profileData.subject = subject;
    }

    await setDoc(doc(db, 'profiles', userId), profileData);
    await firebaseSignOut();
    showNotification(
      'Registration successful! You can now log in.'
    );
  };

  const loginWithGoogle = async () => {
    const result = await firebaseGoogleSignIn();
    await routeUser(result.user);
  };

  const logout = async () => {
    await firebaseSignOut();
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
    // Create auth user
    const result = await firebaseSignUp(email, password);
    const userId = result.user.uid;

    // Create profile
    await setDoc(doc(db, 'profiles', userId), {
      id: userId,
      name,
      email,
      username: username || null,
      role: 'doctor',
      subject,
      status: 'approved',
      createdAt: new Date().toISOString(),
    });

    // Sign out the new doctor and sign back in as admin
    await firebaseSignOut();
    await firebaseSignIn(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    
    await loadData();
    showNotification('Doctor added successfully!');
  };

  const deleteDoctor = async (id: string) => {
    try {
      // Delete the profile
      await deleteDoc(doc(db, 'profiles', id));

      // Delete their slots
      const doctorSlotsQuery = query(slotsRef, where('doctorId', '==', id));
      const doctorSlots = await getDocs(doctorSlotsQuery);
      for (const slotDoc of doctorSlots.docs) {
        await deleteDoc(doc(db, 'slots', slotDoc.id));
      }

      // Delete their appointments
      const doctorApptsQuery = query(appointmentsRef, where('doctorId', '==', id));
      const doctorAppts = await getDocs(doctorApptsQuery);
      for (const apptDoc of doctorAppts.docs) {
        await deleteDoc(doc(db, 'appointments', apptDoc.id));
      }

      await loadData();
      showNotification('Doctor deleted.');
    } catch (error) {
      console.error('deleteDoctor error:', error);
      showNotification('Failed to delete doctor', 'error');
    }
  };

  const deletePatient = async (id: string) => {
    try {
      // Delete the profile
      await deleteDoc(doc(db, 'profiles', id));

      // Delete their appointments
      const patientApptsQuery = query(appointmentsRef, where('patientId', '==', id));
      const patientAppts = await getDocs(patientApptsQuery);
      for (const apptDoc of patientAppts.docs) {
        await deleteDoc(doc(db, 'appointments', apptDoc.id));
      }

      await loadData();
      showNotification('Patient deleted.');
    } catch (error) {
      console.error('deletePatient error:', error);
      showNotification('Failed to delete patient', 'error');
    }
  };

  /* ---- doctor actions ------------------------------------------- */
  const addSlot = async (date: string, time: string, duration: number) => {
    if (!currentUser) return;
    const slotId = generateId();
    await setDoc(doc(db, 'slots', slotId), {
      id: slotId,
      doctorId: currentUser.id,
      date,
      time,
      duration,
      isBooked: false,
      createdAt: new Date().toISOString(),
    });
    await loadData();
    showNotification('Time slot added!');
  };

  const deleteSlotAction = async (id: string) => {
    await deleteDoc(doc(db, 'slots', id));
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
    const msgId = generateId();
    await setDoc(doc(db, 'messages', msgId), {
      id: msgId,
      senderId: currentUser.id,
      senderName: currentUser.name || currentUser.email,
      senderRole: currentRole as 'doctor' | 'patient',
      receiverId,
      receiverName,
      content,
      createdAt: new Date().toISOString(),
    });
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
    
    const apptId = generateId();
    
    // Create appointment
    await setDoc(doc(db, 'appointments', apptId), {
      id: apptId,
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
    });

    // Update slot as booked
    await setDoc(doc(db, 'slots', slot.id), {
      ...slot,
      isBooked: true,
    });

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
