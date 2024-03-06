export interface User {
  id?: string;
  firstName: string;
  infix?: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  createdAt: { seconds: number; nanoseconds: number };
  company: string;
  licenseCode: string;
  plan: string;
}
