// EmailTypes.ts
import {User} from '@/types/userType'
import {License} from "@/pages/license/licenseTypes";

// Interface for sending an email using a template
export interface EmailInputData {
  templateName: string;
  licenseCode: string;
  user: User;
  license: License;
}

// Data structure that is used in the cloud function SendEmail.
export interface EmailData {
  fromEmail: string;
  fromEmailName: string;
  toEmail: string;
  toEmailName: string;
  replyEmail: string;
  replyEmailName: string;
  subject: string;
  html: string;
}
