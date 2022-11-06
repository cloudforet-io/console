import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { get } from 'lodash';

class Config {
    config: any;

    axiosInstance: AxiosInstance = null as unknown as AxiosInstance;

    constructor() {
        this.config = null;
    }

    createAxiosInstance() {
        const axiosConfig = {
            baseURL: '/config',
            headers: {
                'Cache-Control': 'no-cache',
            },
        };

        this.axiosInstance = axios.create(axiosConfig);
    }

    async load(url) {
        try {
            const response = await this.axiosInstance.get(url);
            this.config = { ...this.config, ...response.data };
        } catch (e) {}
    }

    async init() {
        if (!this.config) {
            this.createAxiosInstance();
            this.config = {};
            await this.load('/default.json');
            await this.load(`/${import.meta.env.MODE}.json`);
        }
    }

    get(key) {
        if (key) {
            return get(this.config, key);
        }
        return this.config;
    }
}

export default new Config();
