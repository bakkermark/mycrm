export interface License {
  address?: string
  city?: string;
  company: string;
  copyright?: string;
  country?: string;
  countUsers: number;
  email: string;
  emailSignature?: string;
  firstName: string;
  fullName: string;
  id: string;
  infix?: string;
  lastName: string;
  plan: string;
  postalCode?: string;
  state?: string;
  status: "Inactive" | "Active";
  subscriptionStatus: string;
  website?: string;
}
