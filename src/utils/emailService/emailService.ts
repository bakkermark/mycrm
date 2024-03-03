import { EmailInputData } from './emailTypes';
import getEmailTemplate from './../../composables/emailTemplate/getEmailTemplate';
import { replaceVariablesInTemplate } from "@/utils/emailService/emailUtils";
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase/config';
import {ApiResponse} from "@/types/apiResponseType";

export const sendTemplateEmail = async (emailData: EmailInputData): Promise<{ success: boolean, message: string }> => {
  try {
    // Retrieve the email template
    const templateResponse = await getEmailTemplate(emailData.templateName, emailData.licenseCode);

    // Check if the retrieval was successful
    if (!templateResponse.success || !templateResponse.returnObject) {
      // If not successful, return an error message
      return { success: false, message: templateResponse.message };
    }

    // If successful, proceed with preparing the email
    const emailTemplate = templateResponse.returnObject;
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

    // Replace variables in the template
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

    // Send the email
    const sendEmail = httpsCallable(functions, 'sendEmail');
    const result = await sendEmail(emailDataToSend);
    const data = result.data as ApiResponse; // Adjust based on how your cloud function returns data

    // Check the response from the cloud function
    if (data && data.success) {
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    // Catch and handle any errors
    return { success: false, message: 'Email could not be sent due to an error: ${error.message}' };
  }
};
