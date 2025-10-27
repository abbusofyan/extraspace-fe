export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface Facility {
  id: string;
  name: string;
  locationCode: string;
  countryId: string;
  country?: Country;
}

export interface UnitType {
  id: string;
  name: string;
  facilityId: string;
  facility?: Facility;
}

export interface UnitSize {
  id: string;
  name: string;
  unitTypeId: string;
  unitType?: UnitType;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'superadmin' | 'operations' | 'marketing';
  countries: string[];
  facilities: string[];
  isActive: boolean;
  createdAt: string;
}

export interface FormEntry {
  id: string;
  formId: string;
  facility: string;
  unitType: string;
  unitSize: string;
  duration: string;
  name: string;
  email: string;
  contact: string;
  promoCodes: string[];
  submittedAt: string;
  status: 'processing' | 'no-quotation' | 'quoted' | 'booked';
  quotedAmount?: number;
  unitsAvailable?: number;
  pricePerUnit?: number;
  moveInFee?: number;
}

export interface QuoteRequest {
  facility: string;
  unitType: string;
  unitSize: string;
  duration: string;
  name: string;
  email: string;
  contact: string;
  promoCodes: string[];
}