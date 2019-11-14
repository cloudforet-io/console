const casual = require('casual-browserify');

export const arrayOf = (times, generator, ...args) => {
    const result = [];
    for (let i = 0; i < times; ++i) {
        if (args) {
            result.push(generator(...args));
        } else {
            result.push(generator());
        }
    }
    return result;
};

const provider = {
    make_id(name) {
        return `${name}_${casual._uuid().slice(-8)}`;
    },
    ip_list() {
        const randomTimes = casual.integer(1, 4);
        return arrayOf(randomTimes, casual._ip);
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
        for (let i = 0; i < casual.integer(3, 5); i++) {
            tag[casual._word()] = casual._word();
        }
        return tag;
    },

};
casual.register_provider(provider);

casual.define('timestamp', () => ({
    seconds: `${casual.unix_time}`,
    nanos: casual.nanos,
}));

casual.define('ipAddress', () => ({
    ip_address: casual.ip,
    subnet_id: casual.make_id('subnet'),
    cidr: casual.cidr,
}));

export default casual;
