import type {
    AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders, CreateAxiosDefaults,
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

    serviceConfig: Record<string, any> = {};

    constructor(baseURL: string, tokenApi: TokenAPI, settings: CreateAxiosDefaults = {}) {
        this.instance = axios.create({
            ...settings,
            headers: {
                'Content-Type': 'application/json',
            },
            baseURL,
        });
        this.tokenApi = tokenApi;
        tokenApi.loadToken();
        this.setAxiosInterceptors();
    }

    private handleResponseError = async (error: AxiosError): Promise<void> => {
        const status = error.response?.status;
        if (status === 400) {
            throw new BadRequestError(error);
        } else if (status === 401) {
            const res = await this.tokenApi.refreshAccessToken();
            if (!res) throw new AuthenticationError(error);
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
            const token = this.tokenApi.getAccessToken();
            if (!auth && token) request.headers.Authorization = `Bearer ${token}`;

            // Check if the service is enabled
            const serviceName = ServiceAPI.extractServiceNameFromEndpoint(request.url || '');
            const serviceInfo = this.serviceConfig[serviceName];
            if (serviceInfo && serviceInfo.enabled === false) {
                throw new Error(`[ServiceAPI] ${serviceName} service is disabled.`);
            }

            return request;
        });

        // Axios's response interceptor with error handling
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            this.handleResponseError,
        );
    }

    private static extractServiceNameFromEndpoint(url: string): string {
        const service = url.split('/')[1];
        if (service) return service;
        return '';
    }

    updateServiceConfig(serviceConfig: Record<string, any>): void {
        this.serviceConfig = serviceConfig;
    }
}
