export type Role = 'fan' | 'staff';

export type LanguageCode = 'en' | 'es' | 'fr' | 'pt' | 'ar' | 'ja' | 'de';

export interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  category?: 'general' | 'navigation' | 'transit' | 'accessibility' | 'operations';
}

export interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  status: 'active' | 'resolved';
  reportedAt: string;
  category: 'crowd' | 'security' | 'medical' | 'transit' | 'facilities';
  description: string;
  responsePlan?: string;
  announcementScript?: string;
  affectedSections?: string[];
}

export interface Facility {
  id: string;
  name: string;
  type: 'gate' | 'concession' | 'restroom' | 'medical' | 'transit';
  crowdLevel: 'low' | 'medium' | 'high';
  waitTimeMinutes: number;
  section: string;
  isAccessible: boolean;
  coordinates: { x: number; y: number };
  status: 'normal' | 'congested' | 'closed';
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  capacity: string;
  facilities: Facility[];
}
