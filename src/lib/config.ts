import axios, { AxiosInstance } from 'axios';
import _ from 'lodash';


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
            await this.load(`/${process.env.NODE_ENV}.json`);
        }
    }

    get(key) {
        if (key) {
            return _.get(this.config, key);
        }
        return this.config;
    }
}

export default new Config();
