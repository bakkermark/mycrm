export interface User {
  id: string;
  firstName: string;
  infix?: string; // Optional, not all users may have this
  lastName: string;
  fullName: string;
  email: string;
  role: "Standard User" | "Admin" | "SuperAdmin";
  status: "Inactive" | "Active";
  avatar?: string;
  createdAt: Date;
  company: string;
  licenseCode: string;
  plan: string;
}
