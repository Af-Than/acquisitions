import jwt from 'jsonwebtoken';
import logger from '#config/logger..js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRATION = '1d'; //

//we need a payload because the jwt.sign method requires a payload to create a token. The payload is an object that contains the data you want to include in the token, such as user information or any other relevant data. In this case, we are passing the payload as an argument to the sign method, which will be used to generate the JWT.
export const jwttoken = {

    sign(payload) {
        try{

        
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
        }
        catch(err){
            logger.error('Error signing JWT:', err);
            console.error('Error signing JWT:', err);
            throw err;
        }
    },
    verify(token) {
        try{
        return jwt.verify(token, JWT_SECRET);
        }
        catch(err){
            logger.error('Error verifying JWT:', err);
            console.error('Error verifying JWT:', err);
            throw err;
        }
}
}
