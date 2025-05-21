
// Institution represents a university or educational institution
export interface Institution {
  id: string;
  name: string;
  email: string;
  logo?: string;
  isApproved: boolean;
  createdAt: string;
}

// User types and roles
export type UserRole = 'student' | 'driver' | 'institution-admin' | 'site-admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  institutionId?: string;
  institutionalEmail?: string;
  institutionalCode?: string;
  role: UserRole;
  createdAt: string;
  avatarUrl?: string;
}

// Driver extends User with additional properties
export interface Driver extends User {
  isApproved: boolean;
  rating: number;
  reviewCount: number;
  vehicles: Vehicle[];
  activeRoutes: Route[];
}

// Vehicle information
export interface Vehicle {
  id: string;
  driverId: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  capacity: number;
  isApproved: boolean;
  documents: {
    soat: boolean;
    technicalReview: boolean;
    insurance: boolean;
  };
  createdAt: string;
}

// Route information
export interface Route {
  id: string;
  name?: string;
  origin: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  destination: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  stops?: Array<{
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  }>;
  driverId: string;
  vehicleId: string;
  departureTime: string;
  estimatedArrivalTime: string;
  status: 'active' | 'completed' | 'cancelled';
  capacity: number;
  availableSeats: number;
  createdAt: string;
  transportType: 'car' | 'bus' | 'bike' | 'walk';
}

// Trip represents a reservation made by a user for a specific route
export interface Trip {
  id: string;
  routeId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  passengerCount: number;
}

// Stats for the platform
export interface Stats {
  availableVehicles: number;
  activeRoutes: number;
  connectedTravelers: number;
}

// Incident report
export interface Incident {
  id: string;
  reporterId: string;
  routeId?: string;
  title: string;
  description: string;
  status: 'reported' | 'reviewing' | 'resolved';
  createdAt: string;
  updatedAt: string;
}
