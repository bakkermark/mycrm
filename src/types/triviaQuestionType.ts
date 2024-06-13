export interface TriviaQuestion {
  id: string;
  AuthorLicense: string;
  AuthorName: string;
  AuthorSourceUrl: string;
  Category: string;
  ChangeDateTime: Date;
  CorrectAnswer: string;
  IncorrectAnswers: string[];
  Level: string;
  Points: number;
  QuestionClarification: string;
  QuestionMediaUrl: string;
  QuestionMediaType: string;
  QuestionText: string;
}
