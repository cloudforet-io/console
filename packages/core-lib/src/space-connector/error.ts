/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
import type { AxiosError } from 'axios';

import { RESPONSE } from '@/space-connector/type';

export class APIError extends Error {
    status?: number;

    code?: string;

    axiosError?: AxiosError;

    constructor(axiosError: AxiosError) {
	    super();
	    this.name = RESPONSE.API_ERROR;
	    this.status = 500;
	    this.code = 'ERROR_UNKNOWN';
	    this.axiosError = axiosError;

	    if (axiosError.response) {
	        this.status = axiosError.response.status;

	        if (axiosError.response.data.error) {
	            this.message = axiosError.response.data.error.message;
	            this.code = axiosError.response.data.error.code;
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
