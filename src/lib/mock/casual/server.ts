/* eslint-disable camelcase */
import { arrayOf } from '@/lib/casual';
// eslint-disable-next-line import/no-cycle
import { modelType } from '@/lib/mock/casual/index';

const securityGroupRule = (casual) => {
    casual.define('securityGroupRule', () => ({
        port_range_min: casual.integer(0, 1000),
        port_range_max: casual.integer(28200, 65535),
        security_group_id: casual.make_id('sg'),
        direction: casual.random_element(['inbound', 'outbound']),
        remote_cidr: casual.cidr,
        protocol: casual.random_element(['tcp', 'udp', 'all']),
        remote_group_id: null,
        security_group_name: casual.security_group_name,
    }));
    return casual;
};

const serverData = (casual) => {
    casual.define('serverData', () => ({
        os: {
            os_distro: 'amazonlinux',
            os_arch: 'x86_64',
        },
        base: {
            memory: casual.integer(2, 125),
            core: casual.integer(1, 20),
        },
        platform: {
            type: casual.random_element(['AWS', 'AZURE', 'GCP']),
        },
        compute: {
            created_by_user_id: casual._uuid().slice(-12),
            instance_id: casual.make_id('i'),
            keypair: 'spaceone-dev-kubectl-ec2-key',
            instance_name: 'spaceone-dev-eks-cluster_kubectl-test',
            static_nat: arrayOf(casual.integer(1, 3), casual._ip),
            security_groups: arrayOf(casual.integer(1, 6), casual._security_group_name),
            security_group_rules: arrayOf(casual.integer(1, 6), casual._securityGroupRule),
            instance_type: 'unknown',
            image: 'amzn2-ami-hvm-2.0.20190823.1-x86_64-gp2',
        },
        vm: {
            host: '',
            image: 'amzn2-ami-hvm-2.0.20190823.1-x86_64-gp2',
            host_vm_id: casual.make_id('i'),
            vm_id: casual.make_id('i'),
            vm_name: 'spaceone-dev-eks-cluster_kubectl-test',
            platform_type: casual.random_element(['AWS', 'AZURE', 'GCP']),
        },
    }));
    return casual;
};

const nic = (casual) => {
    casual.define('nic', () => ({
        mac_address: 'aa:1f:va:v3:ad:fa:b3',
        device_index: 0,
        device: '',
        nic_type: 'PHYSICAL',
        tags: casual.tags,
        ip_addresses: arrayOf(casual.integer(1, 5), casual._ipAddress),
    }));
    return casual;
};

const disk = (casual) => {
    casual.define('disk', () => ({
        device_index: 0,
        disk_id: '',
        device: 'xvda',
        storage_id: '',
        size: 8,
        tags: casual.tags,
        disk_type: 'Ebs',
        volume_id: casual.make_id('vol'),
    }));
    return casual;
};

const zoneInfo = (casual) => {
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
    return casual;
};

const poolInfo = (casual) => {
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
    return casual;
};

const regionInfo = (casual) => {
    casual.define('regionInfo', () => ({
        region_id: casual.make_id('region'),
        state: casual.random_element(['ACTIVE', 'DEACTIVE']),
        name: casual.word,
        tags: casual.tags,
        domain_id: casual.make_id('domain'),
        created_at: casual.timestamp,
        deleted_at: casual.timestamp,
    }));
    return casual;
};

const collectInfo = (casual) => {
    casual.define('collectInfo', () => ({
        state: 'NEW',
        collectors: arrayOf(casual.integer(1, 3), casual.make_id, 'collector'),
        update_history: [],
        pinned_keys: [],
    }));
    return casual;
};

const server = (casual) => {
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
        region_info: casual.regionInfo,
        project_id: casual.make_id('project'),
        domain_id: casual.make_id('domain'),
        tags: casual.tags,
        collection_info: casual.collectInfo,
        created_at: casual.timestamp,
        updated_at: casual.timestamp,
        deleted_at: null,
    }));
    return casual;
};

export interface ServerCasual {
    securityGroupRule?: any;
    _securityGroupRule?: any;
    serverData?: any;
    _serverData?: any;
    nic?: any;
    _nic?: any;
    disk?: any;
    _disk?: any;
    zoneInfo?: any;
    _zoneInfo?: any;
    poolInfo?: any;
    _poolInfo?: any;
    regionInfo?: any;
    _regionInfo?: any;
    collectInfo?: any;
    _collectInfo?: any;
    server?: any;
    _server?: any;
}


const result: modelType[] = [
    securityGroupRule, serverData, nic, disk,
    zoneInfo, poolInfo, regionInfo, collectInfo,
    server,
];

export default result;
