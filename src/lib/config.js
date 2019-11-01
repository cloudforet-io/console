import _ from 'lodash';
import axios from 'axios';

class Config {
    constructor() {
        this.config = undefined;
    }

    async loadConfig(url) {
        try {
            const response = await this.axios.get(url);
            return response.data;
        } catch (e) {
            return {};
        }
    }

    async load() {
        const axiosConfig = {
            baseURL: '/config',
            headers: {
                'Cache-Control': 'no-cache',
            },
        };

        this.axios = axios.create(axiosConfig);

        this.config = await this.loadConfig('/default.json');
        _.merge(this.config, await this.loadConfig(`/${process.env.NODE_ENV}.json`));
    }

    async init() {
        if (!this.config) {
            console.log('==== init config ====');
            await this.load();
            console.log('==== async done ====');
        }
    }

    get(key) {
        const config = this.config || {};
        if (key) {
            return _.get(config, key);
        } else {
            return config;
        }
    }
}

export default new Config();
