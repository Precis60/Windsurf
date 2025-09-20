import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

// Collection names
const COLLECTIONS = {
  APPOINTMENTS: 'appointments',
  CREDENTIALS: 'credentials', 
  CUSTOMERS: 'customers'
};

// Appointments Service
export const appointmentsService = {
  // Get all appointments
  async getAll() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.APPOINTMENTS), orderBy('date', 'asc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },

  // Add new appointment
  async add(appointment) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), {
        ...appointment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: docRef.id, ...appointment };
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  },

  // Update appointment
  async update(id, appointment) {
    try {
      const docRef = doc(db, COLLECTIONS.APPOINTMENTS, id);
      await updateDoc(docRef, {
        ...appointment,
        updatedAt: new Date().toISOString()
      });
      return { id, ...appointment };
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  // Delete appointment
  async delete(id) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.APPOINTMENTS, id));
      return id;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },

  // Listen to real-time updates
  onSnapshot(callback) {
    return onSnapshot(
      query(collection(db, COLLECTIONS.APPOINTMENTS), orderBy('date', 'asc')),
      (snapshot) => {
        const appointments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(appointments);
      }
    );
  }
};

// Credentials Service
export const credentialsService = {
  // Get all credentials
  async getAll() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.CREDENTIALS), orderBy('serviceName', 'asc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching credentials:', error);
      return [];
    }
  },

  // Add new credential
  async add(credential) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.CREDENTIALS), {
        ...credential,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: docRef.id, ...credential };
    } catch (error) {
      console.error('Error adding credential:', error);
      throw error;
    }
  },

  // Update credential
  async update(id, credential) {
    try {
      const docRef = doc(db, COLLECTIONS.CREDENTIALS, id);
      await updateDoc(docRef, {
        ...credential,
        updatedAt: new Date().toISOString()
      });
      return { id, ...credential };
    } catch (error) {
      console.error('Error updating credential:', error);
      throw error;
    }
  },

  // Delete credential
  async delete(id) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.CREDENTIALS, id));
      return id;
    } catch (error) {
      console.error('Error deleting credential:', error);
      throw error;
    }
  },

  // Listen to real-time updates
  onSnapshot(callback) {
    return onSnapshot(
      query(collection(db, COLLECTIONS.CREDENTIALS), orderBy('serviceName', 'asc')),
      (snapshot) => {
        const credentials = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(credentials);
      }
    );
  }
};

// Customers Service
export const customersService = {
  // Get all customers
  async getAll() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.CUSTOMERS), orderBy('companyName', 'asc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  },

  // Add new customer
  async add(customer) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.CUSTOMERS), {
        ...customer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: docRef.id, ...customer };
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  },

  // Update customer
  async update(id, customer) {
    try {
      const docRef = doc(db, COLLECTIONS.CUSTOMERS, id);
      await updateDoc(docRef, {
        ...customer,
        updatedAt: new Date().toISOString()
      });
      return { id, ...customer };
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  // Delete customer
  async delete(id) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.CUSTOMERS, id));
      return id;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Listen to real-time updates
  onSnapshot(callback) {
    return onSnapshot(
      query(collection(db, COLLECTIONS.CUSTOMERS), orderBy('companyName', 'asc')),
      (snapshot) => {
        const customers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(customers);
      }
    );
  }
};

// Utility function to migrate localStorage data to Firebase
export const migrateLocalStorageToFirebase = async () => {
  try {
    // Migrate appointments
    const localAppointments = localStorage.getItem('appointments');
    if (localAppointments) {
      const appointments = JSON.parse(localAppointments);
      for (const appointment of appointments) {
        const { id, ...appointmentData } = appointment;
        await appointmentsService.add(appointmentData);
      }
      localStorage.removeItem('appointments');
      console.log('Appointments migrated to Firebase');
    }

    // Migrate credentials
    const localCredentials = localStorage.getItem('companyCredentials');
    if (localCredentials) {
      const credentials = JSON.parse(localCredentials);
      for (const credential of credentials) {
        const { id, ...credentialData } = credential;
        await credentialsService.add(credentialData);
      }
      localStorage.removeItem('companyCredentials');
      console.log('Credentials migrated to Firebase');
    }

    // Migrate customers
    const localCustomers = localStorage.getItem('companyCustomers');
    if (localCustomers) {
      const customers = JSON.parse(localCustomers);
      for (const customer of customers) {
        const { id, ...customerData } = customer;
        await customersService.add(customerData);
      }
      localStorage.removeItem('companyCustomers');
      console.log('Customers migrated to Firebase');
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};
