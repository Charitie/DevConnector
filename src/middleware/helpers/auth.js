import jwt from 'jsonwebtoken';
import { config } from '../../config';
import CustomError from './customErrors';

export default function(req, res, next) {
  //Get token from header
  const token = req.header('x-auth-token');

  //Check if not token 
  if(!token) throw new CustomError(401, 'No token, authorization denied');

  try {

    jwt.verify(token, config.secretKey, (error, decoded) => {
      if (error) {
        throw new CustomError(401, 'Token is not valid');
      } else {
        req.user = decoded.user;
        console.log(decoded)
        next();
      }
    });

  } catch (err) {
    console.log('token error', err.message)
    throw new CustomError(500, 'Server Error')
  } 
}


