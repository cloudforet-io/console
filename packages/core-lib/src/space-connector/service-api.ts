import type {
    AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse,
} from 'axios';
import axios from 'axios';

import {
    APIError, AuthenticationError,
    AuthorizationError, BadRequestError,
    NotFoundError,
} from '@/space-connector/error';
import type TokenAPI from '@/space-connector/token-api';

export default class ServiceAPI {
    instance: AxiosInstance;

    tokenApi: TokenAPI;

    constructor(baseURL: string, tokenApi: TokenAPI) {
        this.instance = axios.create({
            headers: {
                'Content-Type': 'application/json',
            },
            baseURL,
        });
        this.tokenApi = tokenApi;
        tokenApi.loadToken();
        this.setAxiosInterceptors();
    }

    private handleRequestError = async (error: AxiosError): Promise<void> => {
        switch (error.response?.status) {
        case 400: {
            throw new BadRequestError(error);
        }
        case 401: {
            const res = await this.tokenApi.refreshAccessToken();
            if (!res) throw new AuthenticationError(error);
            else break;
        }
        case 403: {
            throw new AuthorizationError(error);
        }
        case 404: {
            throw new NotFoundError(error);
        }
        default: {
            throw new APIError(error);
        }
        }
    };

    private setAxiosInterceptors(): void {
        // Axios request interceptor
        this.instance.interceptors.request.use((request: AxiosRequestConfig) => {
            if (!request.headers) request.headers = {};

            // Set the access token
            request.headers.Authorization = `Bearer ${this.tokenApi.getAccessToken()}`;

            return request;
        });

        // Axios's response interceptor with error handling
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            this.handleRequestError,
        );
    }
}
