import { ref } from 'vue';

const getAuthorLicenses = () => {
  const error = ref<string | null>(null);
  const authorLicenses = ref<Array<string>>([
    'AI Generated',
    'Attribution-ShareAlike',
    'Creative Commons license',
    'Public domain license'
  ]);
  const load = () => {
    try {
      if(authorLicenses.value.length === 0) {
        console.log("No data is available.");
      }
    } catch(err) {
      error.value = (err as Error).message;
      console.log("Error: " + error.value);
    }
  };
  return { authorLicenses, error, load };
};

export default getAuthorLicenses;
