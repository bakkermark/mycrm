// Import the necessary modules and functions object from your Firebase config
import {EmailInputData, EmailTemplate} from './emailTypes';
import { httpsCallable } from 'firebase/functions';
import {functions } from '@/firebase/config';
import {replaceVariablesInTemplate} from "@/utils/emailService/emailUtils";
import getEmailTemplate from './../../composables/emailTemplate/getEmailTemplate'

export const sendTemplateEmail = async (emailData: EmailInputData): Promise<{ success: boolean, message: string }> => {

  const sendEmail = httpsCallable(functions, 'sendEmail');
  
  const { template, error, load } = getEmailTemplate(emailData.templateName, emailData.licenseCode);
  await load();
  const emailTemplate = template.value;
  if (error.value) {
    return {success: false, message: `Could not find correct email template due to error: ${error.value}. Please contact support.`};
  }
  if (!emailTemplate) {
    return { success: false, message: 'Could not find correct email template. Please contact support.' };
  }
  
  const variablesData = [
    {
      var: 'user_firstName',
      value: emailData.user.firstName
    },
    {
      var: 'user_infix',
      value: emailData.user.infix
    },
    {
      var: 'user_lastName',
      value: emailData.user.lastName
    },
    {
      var: 'user_fullName',
      value: emailData.user.fullName
    },
    {
      var: 'user_company',
      value: emailData.user.company
    },
    {
      var: 'user_plan',
      value: emailData.user.plan
    },
    {
      var: 'user_licenseCode',
      value: emailData.user.licenseCode
    },
    {
      var: 'user_role',
      value: emailData.user.role
    },
    {
      var: 'user_createdAt',
      value: emailData.user.createdAt
    },
    {
      var: 'user_status',
      value: emailData.user.status
    },
    {
      var: 'app_name',
      value: 'myCRM'
    },
    {
      var: 'app_copyright',
      value: '&copy; 2024 MultiMediaMarkers. Alle rechten voorbehouden.'
    },
    {
      var: 'app_website',
      value: 'https://www.multimediamarkers.com'
    },
    {
      var: 'app_address',
      value: 'Oeverlanden 61'
    },
    {
      var: 'app_postalCode',
      value: '9606RR'
    },
    {
      var: 'app_city',
      value: 'Kropswolde'
    },
    {
      var: 'app_state',
      value: 'Groningen'
    },
    {
      var: 'app_country',
      value: 'Nederland'
    },
    {
      var: 'app_emailSignature',
      value: 'Het myCRM team'
    },
    {
      var: 'url_user_activate',
      value: 'https://dev-mycrm.web.app/login'
    }
  ]
  
  const htmlUpdated = replaceVariablesInTemplate(emailTemplate.htmlTemplate, variablesData);
  
  // Define the email data
  const emailDataToSend = {
    toEmail: emailData.user.email,
    toEmailName: emailData.user.fullName,
    fromEmail: 'info@multimediamarkers.com',
    fromEmailName: 'MultiMediaMarkers | Augmented Reality Apps',
    subject: emailTemplate.subject,
    html: htmlUpdated
  };

  interface ApiResponse {
    success: boolean;
    message: string;
    returnValue?: string
  }

  try {
    const result = await sendEmail(emailDataToSend);
    const data = result.data as ApiResponse;
    if (data.success) {
      return {success: true, message: data.message };
    }
    else {
      return {success: false, message: data.message};
    }
  } catch (error) {
    return { success: false, message: 'Email could not be sent due to an error. Details: ' + error };
  }
};
