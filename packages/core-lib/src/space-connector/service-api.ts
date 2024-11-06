import type {
    AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders,
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

    private handleResponseError = (error: AxiosError): void => {
        const status = error.response?.status;
        if (status === 400) {
            throw new BadRequestError(error);
        } else if (status === 401) {
            this.tokenApi.refreshAccessToken().then((res) => {
                if (!res) throw new AuthenticationError(error);
            });
        } else if (status === 403) {
            throw new AuthorizationError(error);
        } else if (status === 404) {
            throw new NotFoundError(error);
        } else {
            throw new APIError(error);
        }
    };

    private setAxiosInterceptors(): void {
        // Axios request interceptor
        this.instance.interceptors.request.use((request: InternalAxiosRequestConfig) => {
            if (!request.headers) request.headers = {} as AxiosRequestHeaders;

            // Set the access token
            const auth = request.headers?.Authorization;
            if (!auth) request.headers.Authorization = `Bearer ${this.tokenApi.getAccessToken()}`;

            return request;
        });

        // Axios's response interceptor with error handling
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            this.handleResponseError,
        );
    }
}
