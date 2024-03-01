// Import the necessary modules and functions object from your Firebase config
import { TemplateEmailData } from './emailTypes';
import { httpsCallable } from 'firebase/functions';
import { collection, where, query, getDocs } from "firebase/firestore";
import { projectFirestore as firestore , functions } from '@/firebase/config';

export const sendTemplateEmail = async (emailData: TemplateEmailData): Promise<{ success: boolean, message: string }> => {

  const sendEmail = httpsCallable(functions, 'sendEmail');
  async function fetchEmailTemplate(templateName: string, licenseCode: string) {
    const q = query(collection(firestore, 'EmailTemplates'), where('templateName', '==', templateName));

    const querySnapshot = await getDocs(q);

    if(!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  }

  function replaceVariablesInTemplate(htmlTemplate: string, variablesData: any[]) {
    let processedTemplate = htmlTemplate;
    variablesData.forEach(substitution => {
      const regex = new RegExp(`{\\$${substitution.var}}`, 'g');
      processedTemplate = processedTemplate.replace(regex, substitution.value);
    });
    return processedTemplate;
  }
  
  const emailTemplate = await fetchEmailTemplate(emailData.templateName, emailData.licenseCode);
  if (!emailTemplate)
  {
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
