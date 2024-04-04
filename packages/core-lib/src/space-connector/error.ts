/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
import type { AxiosError } from 'axios';

import { RESPONSE } from '@/space-connector/type';

export class APIError extends Error {
    status?: number;

    code?: string;

    axiosError?: AxiosError;

    constructor(axiosError: AxiosError<any>) {
	    super();
	    this.name = RESPONSE.API_ERROR;
	    this.status = 500;
	    this.code = 'ERROR_UNKNOWN';
	    this.axiosError = axiosError;

	    if (axiosError.response) {
	        this.status = axiosError.response.status;

	        if (axiosError.response.data.detail) {
	            this.message = axiosError.response.data.detail.message;
	            this.code = axiosError.response.data.detail.code;
	        } else {
	            this.message = axiosError.response.statusText;
	        }
	    } else {
	        this.message = axiosError.message;
	    }
    }
}

export class NotFoundError extends APIError {
    axiosError: AxiosError;

    constructor(axiosError: AxiosError) {
	    super(axiosError);
	    this.name = RESPONSE.NOT_FOUND_ERROR;
	    this.axiosError = axiosError;
    }
}

export class BadRequestError extends APIError {
    axiosError: AxiosError;

    constructor(axiosError: AxiosError) {
	    super(axiosError);
	    this.name = RESPONSE.BAD_REQUEST_ERROR;
	    this.axiosError = axiosError;
    }
}

export class AuthenticationError extends APIError {
    axiosError: AxiosError;

    constructor(axiosError: AxiosError) {
	    super(axiosError);
	    this.name = RESPONSE.AUTHENTICATION_ERROR;
	    this.axiosError = axiosError;
    }
}

export class AuthorizationError extends APIError {
    constructor(axiosError: AxiosError) {
        super(axiosError);
	    this.name = RESPONSE.AUTHORIZATION_ERROR;
        this.axiosError = axiosError;
    }
}

export const isInstanceOfAPIError = (e: unknown): e is APIError => e instanceof APIError;

export const isInstanceOfNotFoundError = (e: unknown): e is NotFoundError => e instanceof NotFoundError;

export const isInstanceOfBadRequestError = (e: unknown): e is BadRequestError => e instanceof BadRequestError;

export const isInstanceOfAuthenticationError = (e: unknown): e is AuthenticationError => e instanceof AuthenticationError;

export const isInstanceOfAuthorizationError = (e: unknown): e is AuthorizationError => e instanceof AuthorizationError;

export const makeError = (message: string, status = 500): APIError|NotFoundError|BadRequestError|AuthenticationError|AuthorizationError => {
    const axiosError = { message } as AxiosError;
    switch (status) {
    case 400: return new BadRequestError(axiosError);
    case 401: return new AuthenticationError(axiosError);
    case 403: return new AuthorizationError(axiosError);
    case 404: return new NotFoundError(axiosError);
    default: return new APIError(axiosError);
    }
};
