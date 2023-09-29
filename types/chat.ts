import { Document } from 'langchain/document';

export type Message = {
  type: 'apiMessage' | 'userMessage';
  message: string;
  data: [];
  format: string;
  isStreaming?: boolean;
};
