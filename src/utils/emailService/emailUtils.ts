export function replaceVariablesInTemplate(htmlTemplate: string, variablesData: any[]) {
  let processedTemplate = htmlTemplate;
  variablesData.forEach(substitution => {
    const regex = new RegExp(`{\\$${substitution.var}}`, 'g');
    processedTemplate = processedTemplate.replace(regex, substitution.value);
  });
  return processedTemplate;
}
