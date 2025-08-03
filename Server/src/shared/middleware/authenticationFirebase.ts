import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';

/**
 * Middleware to authenticate requests using Firebase ID tokens.
 * Expects an Authorization header in the format: "Bearer <token>"
 * 
 * If the token is valid, adds the decoded token to `req.user`.
 * Otherwise, return error ststus
 */

export async function authenticateFirebase(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Check for Bearer token format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  else {
    const idToken = authHeader.split('Bearer ')[1];

    try {
      // Verify the Firebase token and attach decoded user to request
      const decodedToken = await getAuth().verifyIdToken(idToken);
      req.user = decodedToken; // extends Express Request via custom typing
      next();
    } catch (error) {
      res.status(403).json({ error: 'User not authenticated' });
      return;
    }
  }
}
