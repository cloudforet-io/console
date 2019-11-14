import casual, { arrayOf } from '@/lib/casual';

casual.define('security_group_rule', () => ({
    port_range_min: casual.integer(0, 1000),
    port_range_max: casual.integer(28200, 65535),
    security_group_id: casual.make_id('sg'),
    direction: casual.random_element(['inbound', 'outbound']),
    remote_cidr: casual.cidr,
    protocol: casual.random_element(['tcp', 'udp', 'all']),
    remote_group_id: null,
    security_group_name: casual.security_group_name,
}));

casual.define('serverData', () => ({
    os: {
        os_distro: 'amazonlinux',
        os_arch: 'x86_64',
    },
    base: {
        memory: casual.integer(2, 125),
        core: casual.integer(1, 20),
    },
    compute: {
        created_by_user_id: casual._uuid().slice(-12),
        instance_id: casual.make_id('i'),
        keypair: 'cloudone-dev-kubectl-ec2-key',
        instance_name: 'cloudone-dev-eks-cluster_kubectl-test',
        static_nat: arrayOf(casual.integer(1, 3), casual._ip),
        security_groups: arrayOf(casual.integer(1, 6), casual._security_group_name),
        security_group_rules: arrayOf(casual.integer(1, 6), casual._security_group_rule),
        instance_type: 'unknown',
        image: 'amzn2-ami-hvm-2.0.20190823.1-x86_64-gp2',
    },
    vm: {
        host: '',
        image: 'amzn2-ami-hvm-2.0.20190823.1-x86_64-gp2',
        host_vm_id: casual.make_id('i'),
        vm_id: casual.make_id('i'),
        vm_name: 'cloudone-dev-eks-cluster_kubectl-test',
        platform_type: casual.random_element(['AWS', 'AZURE', 'GCP']),
    },
}));


casual.define('nic', () => ({
    mac_address: 'aa:1f:va:v3:ad:fa:b3',
    device_index: 0,
    device: '',
    nic_type: 'PHYSICAL',
    tags: {},
    ip_addresses: arrayOf(casual.integer(1, 5), casual._ipAddress),
}));

casual.define('disk', () => ({
    device_index: 0,
    disk_id: '',
    device: 'xvda',
    storage_id: '',
    size: 8,
    tags: {},
    disk_type: 'Ebs',
    volume_id: casual.make_id('vol'),
}));

casual.define('zoneInfo', () => ({
    zone_id: casual.make_id('zone'),
    name: casual.word,
    state: casual.random_element(['ACTIVE', 'DEACTIVE']),
    tags: {},
    region_info: null,
    domain_id: casual.make_id('domain'),
    created_at: casual.timestamp,
    deleted_at: casual.timestamp,
}));

casual.define('poolInfo', () => ({
    pool_id: casual.make_id('pool'),
    name: casual.word,
    state: casual.random_element(['ACTIVE', 'DEACTIVE']),
    tags: {},
    domain_id: '',
    region_info: null,
    zone_info: null,
    created_at: casual.timestamp,
    deleted_at: casual.timestamp,
}));

casual.define('collectInfo', () => ({
    state: 'NEW',
    collectors: arrayOf(casual.integer(1, 3), casual.make_id, 'collector'),
    data_version: {},
}));
casual.define('server', () => ({
    server_id: casual.make_id('server'),
    name: casual.word,
    state: casual.random_element(['INSERVICE', 'PENDING', 'MAINTENANCE', 'CLOSED', 'DELETED']),
    primary_ip_address: casual.ip,
    ip_addresses: casual.ip_list,
    server_type: casual.random_element(['VM', 'BARE METAL']),
    os_type: casual.random_element(['LINUX', 'WINDOW']),
    data: casual.serverData,
    nics: arrayOf(casual.integer(2, 5), casual._nic),
    disks: arrayOf(casual.integer(2, 5), casual._disk),
    template_data: {},
    pool_info: casual.poolInfo,
    zone_info: casual.zoneInfo,
    project_id: casual.make_id('project'),
    domain_id: casual.make_id('domain'),
    tags: casual.tags,
    collect_info: casual.collectInfo,
    created_at: casual.timestamp,
    updated_at: casual.timestamp,
    deleted_at: null,
}));
export default casual;
