export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cedula: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  reason: string; // Motivo de consulta
  symptoms: string; // Cuadro clínico
  vitalSigns: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    oxygenSaturation?: string;
    weight?: string;
    height?: string;
  };
  diagnosis: string;
  cie10Code?: string;
  treatment: string;
  prescriptions?: string;
  labResults?: string;
  personalHistory?: string; // Antecedentes personales
  familyHistory?: string; // Antecedentes familiares
  allergies?: string; // Alergias
  observations?: string; // Observaciones adicionales
  followUpDate?: string; // Fecha de seguimiento
  urgency?: 'low' | 'medium' | 'high'; // Nivel de urgencia
  notes?: string;
  // Additional fields for better patient experience
  description?: string; // Descripción de la consulta
  specialty?: string; // Especialidad del doctor
  medications?: string[]; // Medicamentos prescritos
  status?: 'active' | 'inactive' | 'pending'; // Estado del tratamiento
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalCertificate {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  type: 'incapacidad' | 'constancia' | 'reposo' | 'certificado_medico';
  startDate: string;
  endDate?: string;
  days?: number;
  diagnosis: string;
  description: string;
  createdAt: string;
}

export interface LaboratoryExam {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  examType: string;
  examName: string;
  date: string;
  results: string;
  fileData?: string; // Base64 encoded file
  fileName?: string;
  fileType?: string;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'certificate' | 'exam' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'patient';
  phone?: string;
  specialization?: string;
  cedula?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  dateOfBirth?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class LocalStorageService {
  private readonly KEYS = {
    PATIENTS: 'medical_patients',
    RECORDS: 'medical_records',
    APPOINTMENTS: 'medical_appointments',
    CERTIFICATES: 'medical_certificates',
    USERS: 'medical_users',
    EXAMS: 'medical_laboratory_exams',
    NOTIFICATIONS: 'medical_notifications'
  };

  // Generic methods
  private getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return [];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Patients
  getPatients(): Patient[] {
    return this.getFromStorage<Patient>(this.KEYS.PATIENTS);
  }

  getPatientById(id: string): Patient | null {
    const patients = this.getPatients();
    return patients.find(p => p.id === id) || null;
  }

  addPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient {
    const patients = this.getPatients();
    const newPatient: Patient = {
      ...patient,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    patients.push(newPatient);
    this.saveToStorage(this.KEYS.PATIENTS, patients);
    return newPatient;
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient | null {
    const patients = this.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return null;

    patients[index] = {
      ...patients[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage(this.KEYS.PATIENTS, patients);
    return patients[index];
  }

  deletePatient(id: string): boolean {
    const patients = this.getPatients();
    const filteredPatients = patients.filter(p => p.id !== id);
    if (filteredPatients.length === patients.length) return false;
    
    this.saveToStorage(this.KEYS.PATIENTS, filteredPatients);
    return true;
  }

  // Medical Records
  getMedicalRecords(): MedicalRecord[] {
    return this.getFromStorage<MedicalRecord>(this.KEYS.RECORDS);
  }

  getRecordsByPatient(patientId: string): MedicalRecord[] {
    return this.getMedicalRecords().filter(r => r.patientId === patientId);
  }

  getRecordsByDoctor(doctorId: string): MedicalRecord[] {
    return this.getMedicalRecords().filter(r => r.doctorId === doctorId);
  }

  addMedicalRecord(record: Omit<MedicalRecord, 'id' | 'createdAt'>): MedicalRecord {
    const records = this.getMedicalRecords();
    const newRecord: MedicalRecord = {
      ...record,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    records.push(newRecord);
    this.saveToStorage(this.KEYS.RECORDS, records);
    return newRecord;
  }

  // Appointments
  getAppointments(): Appointment[] {
    return this.getFromStorage<Appointment>(this.KEYS.APPOINTMENTS);
  }

  getAppointmentsByPatient(patientId: string): Appointment[] {
    return this.getAppointments().filter(a => a.patientId === patientId);
  }

  getAppointmentsByDoctor(doctorId: string): Appointment[] {
    return this.getAppointments().filter(a => a.doctorId === doctorId);
  }

  getTodayAppointments(doctorId?: string): Appointment[] {
    const today = new Date().toISOString().split('T')[0];
    const appointments = this.getAppointments().filter(a => a.date === today);
    return doctorId ? appointments.filter(a => a.doctorId === doctorId) : appointments;
  }

  getAvailableTimeSlots(doctorId: string, date: string): string[] {
    const allTimeSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
    ];

    const existingAppointments = this.getAppointments().filter(
      a => a.doctorId === doctorId && 
           a.date === date && 
           (a.status === 'confirmed' || a.status === 'pending')
    );

    const bookedTimes = existingAppointments.map(a => a.time);
    return allTimeSlots.filter(time => !bookedTimes.includes(time));
  }

  isTimeSlotAvailable(doctorId: string, date: string, time: string): boolean {
    const existingAppointment = this.getAppointments().find(
      a => a.doctorId === doctorId && 
           a.date === date && 
           a.time === time &&
           (a.status === 'confirmed' || a.status === 'pending')
    );
    return !existingAppointment;
  }

  addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment {
    const appointments = this.getAppointments();
    const newAppointment: Appointment = {
      ...appointment,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    appointments.push(newAppointment);
    this.saveToStorage(this.KEYS.APPOINTMENTS, appointments);
    return newAppointment;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const appointments = this.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return null;

    appointments[index] = {
      ...appointments[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage(this.KEYS.APPOINTMENTS, appointments);
    return appointments[index];
  }

  // Medical Certificates
  getCertificates(): MedicalCertificate[] {
    return this.getFromStorage<MedicalCertificate>(this.KEYS.CERTIFICATES);
  }

  getCertificatesByPatient(patientId: string): MedicalCertificate[] {
    return this.getCertificates().filter(c => c.patientId === patientId);
  }

  getCertificatesByDoctor(doctorId: string): MedicalCertificate[] {
    return this.getCertificates().filter(c => c.doctorId === doctorId);
  }

  addCertificate(certificate: Omit<MedicalCertificate, 'id' | 'createdAt'>): MedicalCertificate {
    const certificates = this.getCertificates();
    const newCertificate: MedicalCertificate = {
      ...certificate,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    certificates.push(newCertificate);
    this.saveToStorage(this.KEYS.CERTIFICATES, certificates);
    return newCertificate;
  }

  // Laboratory Exams
  getLaboratoryExams(): LaboratoryExam[] {
    return this.getFromStorage<LaboratoryExam>(this.KEYS.EXAMS);
  }

  getExamsByPatient(patientId: string): LaboratoryExam[] {
    return this.getLaboratoryExams().filter(e => e.patientId === patientId);
  }

  getExamsByDoctor(doctorId: string): LaboratoryExam[] {
    return this.getLaboratoryExams().filter(e => e.doctorId === doctorId);
  }

  addLaboratoryExam(exam: Omit<LaboratoryExam, 'id' | 'createdAt'>): LaboratoryExam {
    const exams = this.getLaboratoryExams();
    const newExam: LaboratoryExam = {
      ...exam,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    exams.push(newExam);
    this.saveToStorage(this.KEYS.EXAMS, exams);
    return newExam;
  }

  updateLaboratoryExam(id: string, updates: Partial<LaboratoryExam>): LaboratoryExam | null {
    const exams = this.getLaboratoryExams();
    const index = exams.findIndex(e => e.id === id);
    if (index === -1) return null;

    exams[index] = {
      ...exams[index],
      ...updates,
      id
    };
    this.saveToStorage(this.KEYS.EXAMS, exams);
    return exams[index];
  }

  // Notifications
  getNotifications(): Notification[] {
    return this.getFromStorage<Notification>(this.KEYS.NOTIFICATIONS);
  }

  getNotificationsByUser(userId: string): Notification[] {
    return this.getNotifications().filter(n => n.userId === userId);
  }

  getUnreadNotificationsByUser(userId: string): Notification[] {
    return this.getNotificationsByUser(userId).filter(n => !n.isRead);
  }

  addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const notifications = this.getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    notifications.push(newNotification);
    this.saveToStorage(this.KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  }

  markNotificationAsRead(id: string): boolean {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) return false;

    notifications[index].isRead = true;
    this.saveToStorage(this.KEYS.NOTIFICATIONS, notifications);
    return true;
  }

  markAllNotificationsAsRead(userId: string): void {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(n => 
      n.userId === userId ? { ...n, isRead: true } : n
    );
    this.saveToStorage(this.KEYS.NOTIFICATIONS, updatedNotifications);
  }

  // System Users
  getSystemUsers(): SystemUser[] {
    return this.getFromStorage<SystemUser>(this.KEYS.USERS);
  }

  addSystemUser(user: Omit<SystemUser, 'id' | 'createdAt' | 'updatedAt'>): SystemUser {
    const users = this.getSystemUsers();
    const newUser: SystemUser = {
      ...user,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    this.saveToStorage(this.KEYS.USERS, users);
    return newUser;
  }

  updateSystemUser(id: string, updates: Partial<SystemUser>): SystemUser | null {
    const users = this.getSystemUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage(this.KEYS.USERS, users);
    return users[index];
  }

  updateUser(user: SystemUser): SystemUser | null {
    return this.updateSystemUser(user.id, user);
  }

  // Initialize with demo data
  initializeDemoData(): void {
    // Only initialize if no data exists
    if (this.getPatients().length === 0) {
      // Demo patients
      const demoPatients: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'María González',
          email: 'maria.gonzalez@email.com',
          phone: '+34 600 111 222',
          cedula: '12345678A',
          dateOfBirth: '1985-05-15',
          address: 'Calle Mayor 123, Madrid',
          emergencyContact: 'José González',
          emergencyPhone: '+34 600 333 444',
          bloodType: 'O+',
          allergies: 'Penicilina',
          chronicDiseases: 'Hipertensión'
        },
        {
          name: 'Carlos López',
          email: 'carlos.lopez@email.com',
          phone: '+34 600 555 666',
          cedula: '87654321B',
          dateOfBirth: '1978-11-22',
          address: 'Avenida Principal 456, Barcelona',
          emergencyContact: 'Ana López',
          emergencyPhone: '+34 600 777 888',
          bloodType: 'A-',
          allergies: 'Ninguna conocida',
          chronicDiseases: 'Diabetes Tipo 2'
        }
      ];

      demoPatients.forEach(patient => this.addPatient(patient));
    }

    if (this.getSystemUsers().length === 0) {
      // Demo system users
      const demoUsers: Omit<SystemUser, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Dr. Ana García',
          email: 'admin@clinica.com',
          password: 'admin123',
          role: 'admin',
          phone: '+34 600 123 456',
          isActive: true
        },
        {
          name: 'Dr. Candy Maribel Hoppe Castro',
          email: 'dracandyhoppe@gmail.com',
          password: 'doctor123',
          role: 'doctor',
          phone: '+593 99 715 8494',
          specialization: 'Medicina General',
          isActive: true
        },
        {
          name: 'María López',
          email: 'paciente@email.com',
          password: 'patient123',
          role: 'patient',
          phone: '+34 600 345 678',
          cedula: '12345678X',
          isActive: true
        }
      ];

      demoUsers.forEach(user => this.addSystemUser(user));
    }

    // Demo laboratory exams
    if (this.getLaboratoryExams().length === 0) {
      const demoExams: Omit<LaboratoryExam, 'id' | 'createdAt'>[] = [
        {
          patientId: this.getPatients()[0]?.id || '1',
          patientName: 'María González',
          doctorId: '2',
          doctorName: 'Dr. Candy Maribel Hoppe Castro',
          examType: 'Hematología',
          examName: 'Hemograma Completo',
          date: new Date().toISOString().split('T')[0],
          results: 'Hemoglobina: 14.2 g/dL (Normal)\nHematocrito: 42% (Normal)\nLeucocitos: 7,500/μL (Normal)\nPlaquetas: 250,000/μL (Normal)',
          notes: 'Resultados dentro de parámetros normales'
        },
        {
          patientId: this.getPatients()[1]?.id || '2',
          patientName: 'Carlos López',
          doctorId: '2',
          doctorName: 'Dr. Candy Maribel Hoppe Castro',
          examType: 'Bioquímica',
          examName: 'Glicemia en Ayunas',
          date: new Date().toISOString().split('T')[0],
          results: 'Glicemia: 145 mg/dL (Elevada)\nHbA1c: 7.2% (Elevada)',
          notes: 'Valores elevados, requiere seguimiento'
        }
      ];

      demoExams.forEach(exam => this.addLaboratoryExam(exam));
    }

    // Demo notifications
    if (this.getNotifications().length === 0) {
      const demoNotifications: Omit<Notification, 'id' | 'createdAt'>[] = [
        {
          userId: '2', // Doctor
          type: 'appointment',
          title: 'Nueva Cita Programada',
          message: 'Tienes una nueva cita con María González mañana a las 10:00',
          isRead: false
        },
        {
          userId: '3', // Patient
          type: 'certificate',
          title: 'Certificado Médico Disponible',
          message: 'Tu certificado médico está listo para descargar',
          isRead: false
        }
      ];

      demoNotifications.forEach(notification => this.addNotification(notification));
    }
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const localStorageService = new LocalStorageService();

// Initialize demo data on first load
if (typeof window !== 'undefined') {
  localStorageService.initializeDemoData();
}