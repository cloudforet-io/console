/* eslint-disable camelcase */
import { arrayOf } from '@/lib/casual';
import {ModelType} from "@/lib/mock/casual/type";

const pluginVersion: ModelType = (casual) => {
    casual.define('pluginVersion', () => ({
        version: arrayOf(casual.integer(1, 5), () => `v${casual.integer(1, 5)}`),
    }));
    return casual;
};

const pluginOption: ModelType = (casual) => {
    casual.define('pluginOption', () => {
        const res: any = {
            key: casual.uuid,
            name: casual.word,
            type: casual.random_element(['str', 'bool', 'list', 'int', 'float']),
            is_required: casual.boolean,
        };

        if (casual.random > 0.7) {
            if (res.type === 'str') res.enums = casual.array_of_words(5);
        }
        if (casual.random > 0.7) {
            if (res.type === 'str') res.example = casual.word;
            else if (res.type === 'bool') res.example = casual.boolean;
            else if (res.type === 'int') res.example = casual.integer();
            else if (res.type === 'float') res.example = casual.double();
        }
        if (casual.random > 0.8) {
            if (res.type === 'str') res.default = casual.word;
            else if (res.type === 'bool') res.default = casual.boolean;
            else if (res.type === 'int') res.default = casual.integer();
            else if (res.type === 'float') res.default = casual.double();
            else if (res.type === 'list') res.default = casual.array_of_words();
        }
        return res;
    });
    return casual;
};


const plugin = (casual) => {
    casual.define('plugin', () => ({
        labels: arrayOf(casual.integer(1, 5), () => casual.word),
        domain_id: casual.make_id('domain'),
        plugin_id: casual.make_id('plugin'),
        name: casual.title,
        image: casual.url,
        service_type: casual.random_element(['inventory.collector', 'identity.domain']),
        state: casual.random_element(['ENABLED', 'DISABLED']),
        registry_url: casual.url,
        repository_info: casual._repository,
        tags: {
            ...casual._tags(),
            description: casual.sentence,
            icon: 'https://assets-console-cloudone-stg.s3.ap-northeast-2.amazonaws.com/console-assets/icons/gcp-compute.svg',
        },
        template: {
            credentials: arrayOf(casual.integer(0, 10), casual._pluginOption),
            // options: arrayOf(casual.integer(0, 5), casual._pluginOption),
        },
        project_id: casual.make_id('project'),
        created_at: casual._timestamp,
    }));
    return casual;
};

export interface PluginCasual {
    pluginVersion?: any;
    _pluginVersion?: any;
    pluginOption?: any;
    _pluginOption?: any;
    plugin?: any;
    _plugin?: any;
}

const result: ModelType[] = [
    pluginVersion, pluginOption, plugin,
];

export default result;
