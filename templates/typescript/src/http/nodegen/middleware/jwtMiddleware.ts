import { Request, Response, NextFunction } from 'express';

import Jwt from '../../../services/Jwt';

export default (headerName: string) => {
  return (req: any, res: Response, next: NextFunction) => {
    const deny = (e: any, msg = 'Invalid auth token provided', tokenProvided = '') => {
      console.error(e);
      res.status(401).json({
        message: msg,
        token: tokenProvided,
      });
    };
    let tokenRaw = req.headers[headerName] || false;
    let token = '';
    if (tokenRaw) {
      let tokenParts = tokenRaw.split('Bearer ');
      if (tokenParts.length > 0) {
        token = tokenParts[1];
      }
    } else {
      return deny('No token to parse', 'No auth token provided.', JSON.stringify(req.headers));
    }

    // Please apply here your own token verification logic
    Jwt.verifyJWTToken(token)
      .then((decodedToken: any) => {
        req['jwtData'] = decodedToken['data'];
        req['originalToken'] = token;
        next();
      })
      .catch(() => {
        deny('Auth signature invalid.', 'Invalid auth token!');
      });
  }
};