export interface EmailTemplate {
  subject: string;
  htmlTemplate: string;
  htmlThumbnail: string;
  createdAt: Date;
  description: string;
  licenseCode: string;
  templateGroup: string;
  templateName: string;
  updatedAt: Date;
  templateType: string;
  createdBy: string;
  updatedBy: string;
  lastEmailSent: Date;
  fromEmail: string;
  fromEmailName: string;
  replyEmail: string;
  replyEmailName: string;
}
