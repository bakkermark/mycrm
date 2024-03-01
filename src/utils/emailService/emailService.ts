import { EmailInputData } from './emailTypes';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase/config';
import { replaceVariablesInTemplate } from '../emailService/emailUtils';
import getEmailTemplate from '../../composables/emailTemplate/getEmailTemplate';

export const sendTemplateEmail = async (inputData: EmailInputData): Promise<{ success: boolean, message: string }> => {

  const sendEmail = httpsCallable(functions, 'sendEmail');
  let emailTemplate
  let htmlUpdated
  
  // Get the emailTemplate.
  try {
    const { load, template, error } = getEmailTemplate(inputData.templateName, inputData.licenseCode);
    await load();
    if (error.value) {
      console.error('Error fetching email template:', error.value);
      return { success: false, message: 'Error fetching email template. Please contact support.' };
    }
    emailTemplate = template.value;
    if (!emailTemplate) {
      console.log("Emailtemplate could not be found. Details: " + inputData.templateName, inputData.licenseCode)
      return { success: false, message: 'Could not find correct email template. Please contact support.' };
    }
  } catch (error) {
    console.error('Error fetching email template:', error);
    return { success: false, message: 'Error fetching email template. Please contact support.' };
  }
  
  // Replace variables in retrieve emailTemplate.
  try {
    const variablesData = [
      {
        var: 'user_firstName',
        value: inputData.user.firstName
      },
      {
        var: 'user_infix',
        value: inputData.user.infix
      },
      {
        var: 'user_lastName',
        value: inputData.user.lastName
      },
      {
        var: 'user_fullName',
        value: inputData.user.fullName
      },
      {
        var: 'user_company',
        value: inputData.user.company
      },
      {
        var: 'user_plan',
        value: inputData.user.plan
      },
      {
        var: 'user_licenseCode',
        value: inputData.user.licenseCode
      },
      {
        var: 'user_role',
        value: inputData.user.role
      },
      {
        var: 'user_createdAt',
        value: inputData.user.createdAt
      },
      {
        var: 'user_status',
        value: inputData.user.status
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
        value: 'Rotterdam'
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
    
    // Attempt to replace variables in the template
    htmlUpdated = replaceVariablesInTemplate(emailTemplate.htmlTemplate, variablesData);
  } catch (error) {
    // Handle errors that occur during replaceVariablesInTemplate
    console.error('Error replacing variables in template:', error);
    return { success: false, message: 'Error processing email template. Please contact support.' };
  }
  
  // Define the email data to be sent to cloud emailSent function.
  const emailDataToSend = {
    toEmail: inputData.user.email,
    toEmailName: inputData.user.fullName,
    fromEmail: emailTemplate.fromEmail,
    fromEmailName: emailTemplate.fromEmailName,
    replyEmail: emailTemplate.replyEmail,
    replyEmailName: emailTemplate.replyEmailName,
    subject: emailTemplate.subject,
    html: htmlUpdated
  };

  // Call the cloud function and handle the response
  try {
    const result = await sendEmail(emailDataToSend);
    if (result) {
      console.log('Email sent successfully. Details: ' + JSON.stringify(result))
      return {success: true, message: 'Email sent successfully.'};
    }
    else {
      console.log('Email could not be sent. Details: ' + + JSON.stringify(result))
      return {success: false, message: 'Email could not be sent.'};
    }
  } catch (error) {
    const message = (error as Error).message;
    return { success: false, message: 'Email could not be sent by other error. Details: ' + message };
  }
};
