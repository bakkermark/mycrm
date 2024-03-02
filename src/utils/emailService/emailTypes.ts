// EmailTypes.ts
import {User} from '@/composables/users/userType'
import {License} from "@/pages/license/licenseTypes";

// Interface for sending an email using a template
export interface EmailInputData {
  templateName: string;
  licenseCode: string;
  user: User;
  license: License;
}

// Data structure of the EmailTemplate
export interface EmailTemplate {
  subject: string;
  htmlTemplate: string;
  createdAt: Date,
  description: string,
  licenseCode: string,
  templateGroup: string,
  templateName: string,
  updatedAt: Date,
  templateType: string,
  createdBy: string,
  updatedBy: string,
  lastEmailSent: Date,
  fromEmail: string,
  fromEmailName: string,
  replyEmail: string,
  replyEmailName: string
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
