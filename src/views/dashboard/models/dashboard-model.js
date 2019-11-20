import casual, { dictOf } from '@/lib/casual';

casual.define('serverStates', () => ({
    INSERVICE: casual.integer(0, 1000),
    MAINTENANCE: casual.integer(0, 1000),
    CLOSED: casual.integer(0, 1000),
}));

casual.define('coordinate', () => ({
    [casual.make_id(casual.random_element('region', 'zone', 'pool'))]: {
        name: casual.country,
        count: casual.integer(0, 1000),
        coordinates: {
            latitude: casual.latitude,
            longitude: casual.longitude,
        },
    },
}));

casual.define('resourcesByRegion', () => dictOf(casual.integer(1, 10), casual._coordinate));

export default casual;
