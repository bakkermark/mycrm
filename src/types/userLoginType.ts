export interface UserLogin {
  id: string
  browser: string;
  city: string;
  country: string; // Optional, not all users may have this
  device: string;
  ipAddress: string;
  createdAt: Date;
  location: string,
  os: string,
  region: string,
  userId: string
}
