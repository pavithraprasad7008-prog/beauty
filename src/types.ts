export interface Service {
  id: string;
  name: string;
  category: 'Waxing' | 'Facial & Cleanup' | 'Manicure & Pedicure' | 'Threading & Face Wax' | 'D-Tan & Bleach' | 'Hair Services';
  price: number;
  durationMinutes: number;
  benefits: string[];
  ingredients: string[];
  skinType: string;
  procedure: string[];
  aftercare: string[];
  safety: string[];
  hygiene: string[];
  imageSeed: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  serviceIds: string[];
  date: string; // YYYY-MM-DD
  timeSlot: string; // "07:00 AM" etc
  discountApplied: number; // Value in INR
  gdpTaxApplied: number; // Value in INR (GST/GDP cover)
  totalPrice: number;
  paymentType: 'Post-Service Cash' | 'Post-Service Card/UPI';
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  rating?: number;
  review?: string;
  customerCoords?: {
    lat: number;
    lng: number;
  };
  technicianMarker?: {
    lat: number;
    lng: number;
  };
}

export interface Product {
  id: string;
  name: string;
  price: number;
  volume: string;
  category: string;
  keyIngredients: string[];
  benefit: string;
  rating: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'booking' | 'promo' | 'system';
  read: boolean;
}
