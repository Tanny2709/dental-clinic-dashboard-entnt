
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Patient {
  id: string;
  name: string;
  dob: string;
  contact: string;
  email?: string;
  address?: string;
  healthInfo: string;
  createdAt: string;
}

export interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Incident {
  id: string;
  patientId: string;
  title: string;
  description: string;
  comments: string;
  appointmentDate: string;
  cost?: number;
  treatment?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  nextDate?: string;
  files: FileAttachment[];
  createdAt: string;
}

interface DataContextType {
  patients: Patient[];
  incidents: Incident[];
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  addIncident: (incident: Omit<Incident, 'id' | 'createdAt'>) => void;
  updateIncident: (id: string, incident: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  getPatientIncidents: (patientId: string) => Incident[];
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialPatients: Patient[] = [
  {
    id: "p1",
    name: "John Doe",
    dob: "1990-05-10",
    contact: "1234567890",
    email: "john@entnt.in",
    address: "123 Main St, City, State",
    healthInfo: "No allergies, diabetic",
    createdAt: new Date().toISOString()
  },
  {
    id: "p2",
    name: "Jane Smith",
    dob: "1985-08-15",
    contact: "0987654321",
    email: "jane@entnt.in",
    address: "456 Oak Ave, City, State",
    healthInfo: "Allergic to penicillin",
    createdAt: new Date().toISOString()
  }
];

const initialIncidents: Incident[] = [
  {
    id: "i1",
    patientId: "p1",
    title: "Toothache",
    description: "Upper molar pain",
    comments: "Sensitive to cold drinks",
    appointmentDate: "2025-07-08T10:00:00",
    cost: 80,
    treatment: "Root canal therapy",
    status: "Completed",
    nextDate: "2025-07-15T10:00:00",
    files: [],
    createdAt: new Date().toISOString()
  },
  {
    id: "i2",
    patientId: "p1",
    title: "Routine Cleaning",
    description: "Regular dental cleaning and checkup",
    comments: "Good oral hygiene",
    appointmentDate: "2025-07-10T14:00:00",
    status: "Scheduled",
    files: [],
    createdAt: new Date().toISOString()
  },
  {
    id: "i3",
    patientId: "p2",
    title: "Cavity Filling",
    description: "Small cavity in lower premolar",
    comments: "Minimal decay",
    appointmentDate: "2025-07-09T11:00:00",
    cost: 120,
    treatment: "Composite filling",
    status: "Completed",
    files: [],
    createdAt: new Date().toISOString()
  }
];

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const storedPatients = localStorage.getItem('dentalPatients');
    const storedIncidents = localStorage.getItem('dentalIncidents');

    if (storedPatients) {
      setPatients(JSON.parse(storedPatients));
    } else {
      setPatients(initialPatients);
      localStorage.setItem('dentalPatients', JSON.stringify(initialPatients));
    }

    if (storedIncidents) {
      setIncidents(JSON.parse(storedIncidents));
    } else {
      setIncidents(initialIncidents);
      localStorage.setItem('dentalIncidents', JSON.stringify(initialIncidents));
    }
  }, []);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updatedPatients = [...patients, newPatient];
    setPatients(updatedPatients);
    saveToStorage('dentalPatients', updatedPatients);
  };

  const updatePatient = (id: string, patientData: Partial<Patient>) => {
    const updatedPatients = patients.map(p => 
      p.id === id ? { ...p, ...patientData } : p
    );
    setPatients(updatedPatients);
    saveToStorage('dentalPatients', updatedPatients);
  };

  const deletePatient = (id: string) => {
    const updatedPatients = patients.filter(p => p.id !== id);
    const updatedIncidents = incidents.filter(i => i.patientId !== id);
    setPatients(updatedPatients);
    setIncidents(updatedIncidents);
    saveToStorage('dentalPatients', updatedPatients);
    saveToStorage('dentalIncidents', updatedIncidents);
  };

  const addIncident = (incidentData: Omit<Incident, 'id' | 'createdAt'>) => {
    const newIncident: Incident = {
      ...incidentData,
      id: `i${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updatedIncidents = [...incidents, newIncident];
    setIncidents(updatedIncidents);
    saveToStorage('dentalIncidents', updatedIncidents);
  };

  const updateIncident = (id: string, incidentData: Partial<Incident>) => {
    const updatedIncidents = incidents.map(i => 
      i.id === i ? { ...i, ...incidentData } : i
    );
    setIncidents(updatedIncidents);
    saveToStorage('dentalIncidents', updatedIncidents);
  };

  const deleteIncident = (id: string) => {
    const updatedIncidents = incidents.filter(i => i.id !== id);
    setIncidents(updatedIncidents);
    saveToStorage('dentalIncidents', updatedIncidents);
  };

  const getPatientIncidents = (patientId: string) => {
    return incidents.filter(i => i.patientId === patientId);
  };

  const refreshData = () => {
    const storedPatients = localStorage.getItem('dentalPatients');
    const storedIncidents = localStorage.getItem('dentalIncidents');
    if (storedPatients) setPatients(JSON.parse(storedPatients));
    if (storedIncidents) setIncidents(JSON.parse(storedIncidents));
  };

  return (
    <DataContext.Provider value={{
      patients,
      incidents,
      addPatient,
      updatePatient,
      deletePatient,
      addIncident,
      updateIncident,
      deleteIncident,
      getPatientIncidents,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
