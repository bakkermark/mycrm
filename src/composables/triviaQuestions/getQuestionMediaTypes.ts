import { ref } from 'vue';

const getQuestionMediaTypes = () => {
  const error: Ref<string | null> = ref(null);
  const questionMediaTypes: Ref<Array<string>> = ref([
    'Image',
    'Sound',
    'Video',
    'YouTube'
  ]);
  const load = () => {
    try {
      if(questionMediaTypes.value.length === 0)
        console.log("No data is available.")
    } catch(err) {
      error.value = (err as Error).message;
        console.log("Error: " + error.value)
    }
  };
  return { QuestionMediaTypes: questionMediaTypes, error, load };
};

export default getQuestionMediaTypes;
