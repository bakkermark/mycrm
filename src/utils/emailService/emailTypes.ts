// EmailTypes.ts

// Interface for user information
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

// Interface for sending an email using a template
export interface TemplateEmailData {
  templateName: string;
  licenseCode: string;
  user: User; // Use the User interface to specify which user to send the email to
}
