export type StreamEvent = {
  type: string;
  message?: string;
  progress?: number;
  text?: string;
  text_length?: number;
};
