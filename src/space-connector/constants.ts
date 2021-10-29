import { ResponseCode } from './type';

export const RESPONSE: {[key in string]: ResponseCode} = {
    API_ERROR: 'APIError',
    BAD_REQUEST_ERROR: 'BadRequestError',
    NOT_FOUND_ERROR: 'NotFoundError',
    AUTHENTICATION_ERROR: 'AuthenticationError',
    AUTHORIZATION_ERROR: 'AuthorizationError'
};
