/* eslint-disable camelcase */
import casual from 'casual-browserify';

type Casual = typeof casual;

/**
 * @param times {Number}
 * @param generator {Function}
 * @param args : parameters for generator function
 * @returns {[]}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any,func-names
export function arrayOf<T=any>(times: number, generator: (...args) => T, ...args): Array<T | undefined> {
    const result: Array<T | undefined> = [];
    for (let i = 0; i < times; ++i) {
        const pushItem: T | undefined = args ? generator(...args) : generator();
        result.push(pushItem);
    }
    return result;
}

/**
 * @param times {Number}
 * @param generator {Function}
 * @param args : parameters for generator function
 * @returns {Object}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dictOf<T=any>(times, generator, ...args): T {
    const result: T = {} as T;
    let i = 0;
    while (i < times) {
        const obj = generator(...args);
        const key = Object.keys(obj)[0];
        if (!result[key]) {
            result[key] = obj[key];
            i += 1;
        }
    }
    return result;
}

interface ProviderInterface {
    make_id(name: string): string;
    ip_list(): Array<string | undefined>;
    label(): string;
    labels(): Array<string | undefined>;
    reference(): {
        resource_id: string;
        external_link: string;
    };
    cidr(): string;
    nanos(): number;
    security_group_name(): string;
    tags(): object;
    defaultImg(): string;
}

type TimestampType = {
    seconds: string;
    nanos: number;
}
type IPAddressType = {
    ip_address: string;
    subnet_id: string;
    cidr: string;
}

type ResourceDataType = {
    name: string;
    ipAddress: string[];
    state: 'INSERVICE' | 'PENDING' | 'MAINTENANCE'| 'CLOSED'| 'DELETED';
}

export interface CustomCasual extends ProviderInterface, Casual {
    timestamp(): TimestampType;
    _timestamp(): TimestampType;
    ipAddress(): IPAddressType;
    _ipAddress(): IPAddressType;
    resourceData(): ResourceDataType;
    _resourceData(): ResourceDataType;
}

const customCasual: CustomCasual = casual as CustomCasual;

const provider: ProviderInterface = {
    make_id(name) {
        return `${name}_${casual._uuid().slice(-8)}`;
    },
    ip_list() {
        const randomTimes = casual.integer(1, 4);
        return arrayOf(randomTimes, casual._ip);
    },
    label() {
        return `#${casual.word}`;
    },
    labels() {
        const randomTimes = casual.integer(0, 4);
        return arrayOf(randomTimes, () => casual.word);
    },
    reference() {
        return {
            resource_id: customCasual.make_id('resource'),
            external_link: casual.url,
        };
    },
    cidr() {
        return `${casual.ip}/${casual.random_element([24, 16, 20])}`;
    },
    nanos() {
        return casual.integer(100000000, 999999999);
    },
    security_group_name() {
        return `${casual.word}.${casual.word}`;
    },
    tags() {
        const tag = {};
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < casual.integer(3, 5); i++) {
            tag[casual._word()] = casual._word();
        }
        return tag;
    },
    defaultImg() {
        return 'https://assets-console-spaceone-stg.s3.ap-northeast-2.amazonaws.com/console-assets/icons/ic_collector_tags.svg';
    },

};
casual.register_provider(provider);

casual.define('timestamp', () => ({
    seconds: `${casual.unix_time}`,
    nanos: customCasual.nanos,
}));

casual.define('ipAddress', () => ({
    ip_address: casual.ip,
    subnet_id: customCasual.make_id('subnet'),
    cidr: customCasual.cidr,
}));

casual.define('resourceData', () => ({
    name: casual.word,
    ipAddress: arrayOf(casual.integer(3, 20), customCasual._ipAddress),
    state: casual.random_element(['INSERVICE', 'PENDING', 'MAINTENANCE', 'CLOSED', 'DELETED']),
}));

export default casual as CustomCasual;
