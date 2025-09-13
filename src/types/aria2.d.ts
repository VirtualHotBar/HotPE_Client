
export interface Aria2Status {
  state: 'request' | 'doing' | 'done' | 'error' | 'stopped';
  speed: string;
  percentage: number;
  remainder: string;
  size: string;
  newSize: string;
  message: string;
}
