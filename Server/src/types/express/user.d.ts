import 'express';

declare module 'express' {
  interface Request {
    user?: {
      uid: string;
      email?: string;
      [key: string]: any;
    } | null; 
  }
}