import { ref } from 'vue';

const getTriviaLevels = () => {
  const error = ref<string | null>(null);
  const triviaLevels = ref<Array<string>>([
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert',
    'Champion'
  ]);
  const load = () => {
    try {
      if(triviaLevels.value.length === 0) {
        console.log("No data is available.");
      }
    } catch(err) {
      error.value = (err as Error).message;
      console.log("Error: " + error.value);
    }
  };
  return { triviaLevels, error, load };
};

export default getTriviaLevels;



