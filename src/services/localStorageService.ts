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
  prescriptions: string;
  labResults?: string;
  notes?: string;
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

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  phone?: string;
  specialization?: string;
  cedula?: string;
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
    USERS: 'medical_users'
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
          role: 'admin',
          phone: '+34 600 123 456',
          isActive: true
        },
        {
          name: 'Dr. Carlos Rodríguez',
          email: 'doctor@clinica.com',
          role: 'doctor',
          phone: '+34 600 789 012',
          specialization: 'Medicina General',
          isActive: true
        },
        {
          name: 'María López',
          email: 'paciente@email.com',
          role: 'patient',
          phone: '+34 600 345 678',
          cedula: '12345678X',
          isActive: true
        }
      ];

      demoUsers.forEach(user => this.addSystemUser(user));
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