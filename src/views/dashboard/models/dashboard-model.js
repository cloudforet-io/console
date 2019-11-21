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

casual.define('serverType', () => ({
    BAREMETAL: casual.integer(0, 1000),
    HYPERVISOR: casual.integer(0, 1000),
    VM: casual.integer(0, 1000),
    UNKNOWN: casual.integer(0, 1000),
}));

casual.define('vmType', () => ({
    AWS: casual.integer(0, 1000),
    AZURE: casual.integer(0, 1000),
    GCP: casual.integer(0, 1000),
    OPENSTACK: casual.integer(0, 1000),
    VMWARE: casual.integer(0, 1000),
}));

casual.define('hypervisorType', () => ({
    KVM: casual.integer(0, 1000),
    VMWARE: casual.integer(0, 1000),
    XENSERVER: casual.integer(0, 1000),
}));

casual.define('osType', () => ({
    WINDOWS: casual.integer(0, 1000),
    LINUX: casual.integer(0, 1000),
}));

export default casual;
