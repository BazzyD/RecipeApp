// Extends Express Request to include a custom `user` object for authenticated requests
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