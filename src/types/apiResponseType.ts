export interface ApiResponse<T = any> { 
  success: boolean;
  message: string;
  details?: string;
  returnValue?: string;
  returnObject?: T;
}
