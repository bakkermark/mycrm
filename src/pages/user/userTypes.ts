export interface User {
  id?: string;
  firstName: string;
  infix?: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  mobile: string;
  role: string;
  status: string;
  avatar?: string;
  country: string;
  language?: string;
  timezone?: string;
  createdAt: { seconds: number; nanoseconds: number };
  company: string;
  licenseCode: string;
  plan: string;
}
