import PTextEditor from '@/components/molecules/text-editor/text-editor/PTextEditor.vue';

export default {
    title: 'molecules/text-editor/text-editor',
    component: PTextEditor,
    parameters: {
        info: {
            summary: '',
            components: { PTextEditor },
        },
    },
};

const value = {
    server_id: 'server-283cd170d17d',
    name: 'spaceone-dev-eks-cluster_kubectl',
    state: 'INSERVICE',
    primary_ip_address: '172.16.1.205',
    ip_addresses: [
        '172.16.1.205',
    ],
    server_type: 'VM',
    os_type: 'LINUX',
    data: {
        vm: {
            platform_type: 'AWS',
            host: '',
            image: 'ubuntu/images/hvm-ssd/ubuntu-bionic-18.04-amd64-server-20190212.1',
            host_vm_id: '',
            vm_id: 'i-0ec8d5289d9662156',
            vm_name: 'spaceone-dev-eks-cluster_kubectl',
        },
        os: {
            os_distro: 'ubuntu',
            os_arch: 'x86_64',
        },
        base: {
            core: 2,
            memory: 0,
        },
        compute: {
            security_group_rules: [
                {
                    security_group_name: 'spaceone-dev-eks-admin-access-sg',
                    port_range_min: 22,
                    port_range_max: 22,
                    security_group_id: 'sg-086347e970cb3bd7b',
                    remote_cidr: '54.180.176.16/32',
                    direction: 'inbound',
                    protocol: 'tcp',
                    remote_group_id: null,
                },
                {
                    security_group_id: 'sg-086347e970cb3bd7b',
                    remote_cidr: '106.244.127.8/32',
                    direction: 'inbound',
                    protocol: 'tcp',
                    remote_group_id: null,
                    security_group_name: 'spaceone-dev-eks-admin-access-sg',
                    port_range_min: 22,
                    port_range_max: 22,
                },
                {
                    security_group_name: 'spaceone-dev-eks-admin-access-sg',
                    port_range_min: 22,
                    port_range_max: 22,
                    security_group_id: 'sg-086347e970cb3bd7b',
                    remote_cidr: '221.148.35.250/32',
                    direction: 'inbound',
                    protocol: 'tcp',
                    remote_group_id: null,
                },
                {
                    remote_group_id: null,
                    security_group_name: 'spaceone-dev-eks-admin-access-sg',
                    port_range_min: 22,
                    port_range_max: 22,
                    security_group_id: 'sg-086347e970cb3bd7b',
                    remote_cidr: '172.16.1.238/32',
                    direction: 'inbound',
                    protocol: 'tcp',
                },
                {
                    protocol: 'tcp',
                    remote_group_id: null,
                    security_group_name: 'spaceone-dev-eks-admin-access-sg',
                    port_range_min: 3000,
                    port_range_max: 3000,
                    security_group_id: 'sg-086347e970cb3bd7b',
                    remote_cidr: '221.144.192.28/32',
                    direction: 'inbound',
                },
                {
                    protocol: 'all',
                    remote_group_id: null,
                    security_group_name: 'spaceone-dev-eks-admin-access-sg',
                    port_range_min: 'all',
                    port_range_max: 'all',
                    security_group_id: 'sg-086347e970cb3bd7b',
                    remote_cidr: '0.0.0.0/0',
                    direction: 'outbound',
                },
            ],
            instance_type: 'unknown',
            image: 'ubuntu/images/hvm-ssd/ubuntu-bionic-18.04-amd64-server-20190212.1',
            created_by_user_id: '072548720675',
            instance_id: 'i-0ec8d5289d9662156',
            keypair: 'spaceone-dev-kubectl-ec2-key',
            instance_name: 'spaceone-dev-eks-cluster_kubectl',
            static_nat: [
                '13.125.167.139',
            ],
            security_groups: [
                'spaceone-dev-eks-admin-access-sg',
            ],
        },
    },
    nics: [
        {
            device_index: 0,
            device: '',
            nic_type: 'PHYSICAL',
            ip_addresses: [
                {
                    ip_address: '172.16.1.205',
                    cidr: '172.16.1.0/24',
                    subnet_id: '',
                },
            ],
            mac_address: '02:d9:d9:07:dc:88',
            tags: {},
        },
    ],
    disks: [
        {
            device_index: 0,
            device: 'sda1',
            size: 8,
            disk_type: 'Ebs',
            disk_id: '',
            volume_id: 'vol-0ec7583dc70af963f',
            storage_id: '',
            tags: {},
        },
    ],
    template_data: {},
    pool_info: {
        pool_id: 'pool-04876e16da9d',
        name: 'KR01-DEV-spaceone',
        state: 'ACTIVE',
        tags: {},
        domain_id: '',
        region_info: null,
        zone_info: null,
        created_at: null,
        deleted_at: null,
    },
    zone_info: {
        zone_id: 'zone-eec238fdf433',
        name: 'KR01-DEV',
        state: 'ACTIVE',
        tags: {},
        region_info: null,
        domain_id: '',
        created_at: null,
        deleted_at: null,
    },
    region_info: {
        region_id: 'region-dc166fcd5836',
        state: 'ACTIVE',
        name: 'KR01',
        tags: {},
        domain_id: '',
        created_at: null,
        deleted_at: null,
    },
    project_id: 'project-4b0a522442fc',
    domain_id: 'domain-22f45f0c5bc4',
    tags: {},
    collection_info: {
        state: 'NEW',
        collectors: [
            'collector-d73e5abf65fd',
            'collector-719e962f838f',
            'collector-6d004ff04d8a',
            'collector-5eb1a46c4946',
        ],
        update_history: [],
        pinned_keys: [],
    },
    created_at: {
        seconds: '1568965462',
        nanos: 956000000,
    },
    updated_at: {
        seconds: '1569384635',
        nanos: 18000000,
    },
    deleted_at: null,
};
const data = {
    code: JSON.stringify(value, undefined, 4),
};
export const defaultCase = () => ({
    components: { PTextEditor },
    template: `
<div style="width: 80vw; height:80vh" class="flex flex-wrap">
    <PTextEditor :value.sync="code" class="sm:w-1/2 pr-4 pl-4"/>
    <pre class="sm:w-1/2 pr-4 pl-4">{{code}}</pre>
</div>`,
    data() {
        return {
            ...data,
        };
    },
});
