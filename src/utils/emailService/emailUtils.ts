import {User} from '@/types/userType'
import {License} from '@/types/licenseType'
export async function replaceVariablesInTemplate(htmlTemplate: string, user: User, license: License): Promise<string> {
  
  // Define variables for substitution based on fetched data
  const variablesData = [
    { var: 'user_firstName', value: user?.firstName ?? 'N/A' },
    { var: 'user_infix', value: user?.infix ?? '' },
    { var: 'user_lastName', value: user?.lastName ?? 'N/A' },
    { var: 'user_fullName', value: user?.fullName ?? 'N/A' },
    { var: 'user_company', value: user?.company ?? 'N/A' },
    { var: 'user_plan', value: user?.plan ?? 'N/A' },
    { var: 'user_licenseCode', value: user?.licenseCode ?? 'N/A' },
    { var: 'user_role', value: user?.role ?? 'N/A' },
    { var: 'user_createdAt', value: user?.createdAt ?? 'N/A' },
    { var: 'user_status', value: user?.status ?? 'N/A' },
    { var: 'app_name', value: 'myCRM' },
    { var: 'license_copyright', value: license?.copyright ?? 'N/A' },
    { var: 'license_website', value: license?.website ?? 'N/A' },
    { var: 'license_address', value: license?.address ?? 'N/A' },
    { var: 'license_postalCode', value: license?.postalCode ?? 'N/A' },
    { var: 'license_city', value: license?.city ?? 'N/A' },
    { var: 'license_state', value: license?.state ?? 'N/A' },
    { var: 'license_country', value: license?.country ?? 'N/A' },
    { var: 'license_emailSignature', value: license?.emailSignature ?? 'N/A' },
    { var: 'url_user_activate', value: 'https://dev-mycrm.web.app/login' },
  ];

  // Replace the variables in the template
  let processedTemplate = htmlTemplate;
  variablesData.forEach(({ var: variableName, value }) => {
    const regex = new RegExp(`{\\$${variableName}}`, 'g');
    processedTemplate = processedTemplate.replace(regex, String(value));
  });

  return processedTemplate;
}
