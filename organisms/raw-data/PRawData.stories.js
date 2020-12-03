import PRawData from '@/components/organisms/raw-data/PRawData.vue';

export default {
    title: 'Data Display/RawData',
    component: PRawData,
    parameters: {
        info: {
            summary: '',
            components: { PRawData },
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
};

export const rawData = () => ({
    components: { PRawData },
    props: {
        item: {
            type: [Object, Array],
            default: value,
        },
        raw: {
            type: String,
            default: undefined,
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    template: `
            <div style="width: 80vw; height:80vh" class="flex flex-wrap">
                <p-raw-data :item="code" :loading="loading" />
            </div>`,
    setup(props) {
        const code = value;
        return {
            code,
        };
    },
});
