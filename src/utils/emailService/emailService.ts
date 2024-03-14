import {emailServiceInputData} from './emailTypes';
import getEmailTemplate from './../../composables/emailTemplate/getEmailTemplate';
import {replaceVariablesInTemplate } from "@/utils/emailService/emailUtils";
import {httpsCallable} from 'firebase/functions';
import {functions} from '@/firebase/config';
import {ApiResponse} from "@/types/apiResponseType";
import getUser from "@/composables/user/getUser";
import getLicense from "@/composables/license/getLicense";
import {User} from '@/types/userType'
import {License} from '@/types/licenseType'

export const sendTemplateEmail = async (emailData: emailServiceInputData): Promise<{ success: boolean, message: string }> => {
  try {
    // Retrieve user data
    const userId = ''+emailData.user?.id
    const userResponse = await getUser(userId);
    const user = userResponse.returnObject as User
    if (!userResponse.success)    {
      // If not successful, return an error message
      return { success: false, message: userResponse.message}
    }
    
    // Retrieve license data
    const licenseId = ''+emailData.license?.id;
    const licenseResponse = await getLicense(licenseId);
    const license = licenseResponse.returnObject as License
    if (!licenseResponse.success)    {
      // If not successful, return an error message
      return { success: false, message: userResponse.message}
    }

    // Retrieve the email template
    const templateResponse = await getEmailTemplate(emailData.templateName, licenseId
    );

    // Check if the retrieval was successful
    if (!templateResponse.success || !templateResponse.returnObject) {
      // If not successful, return an error message
      return { success: false, message: templateResponse.message };
    }

    // If successful, proceed with preparing the email
    const emailTemplate = templateResponse.returnObject;

    // Replace variables in the template
    const htmlUpdated = await replaceVariablesInTemplate(emailTemplate.htmlTemplate, user, license)
    const emailDataToSend = {
      toEmail: user.email,
      toEmailName: user.fullName,
      fromEmail: 'info@multimediamarkers.com',
      fromEmailName: 'MultiMediaMarkers | Augmented Reality Apps',
      subject: emailTemplate.subject,
      html: htmlUpdated,
      licenseId: licenseId
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
