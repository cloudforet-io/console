export default {
    server_id: '',
    name: '',
    state: '',
    primary_ip_address: '',
    ip_addresses: [],
    server_type: '',
    os_type: '',
    data: {
        os: {
            os_distro: '',
            os_details: ''
        },
        base: {
            core: 0, // null or Number
            memory: 0, // null or Number
            kernel: '',
            booted_at: {
                seconds: '',
                nanos: 0
            }
        },
        compute: {
            instance_id: ''
        },
        vm: {
            vm_name: '',
            platform_type: '',
            vm_id: ''
        },
        domain: {
            domain_name: '',
            fqdn: ''
        }
    },
    nics: [
        {
            mac_address: '',
            device_index: 0,
            device: '',
            nic_type: '',
            tags: {},
            ip_addresses: [
                {
                    cidr: '',
                    ip_address: '',
                    subnet_id: ''
                }
            ]
        },
        {
            mac_address: '',
            device_index: 0,
            device: '',
            nic_type: '',
            tags: {},
            ip_addresses: [
                {
                    subnet_id: '',
                    cidr: '',
                    ip_address: ''
                }
            ]
        },
        {
            mac_address: '',
            device_index: 0,
            device: '',
            nic_type: '',
            tags: {},
            ip_addresses: [
                {
                    ip_address: '',
                    subnet_id: '',
                    cidr: ''
                }
            ]
        }
    ],
    disks: [
        {
            device: '',
            storage_id: '',
            size: 0,
            tags: {},
            disk_type: '',
            volume_id: '',
            disk_id: ''
        }
    ],
    template_data: {},
    pool_info: {
        pool_id: '',
        name: ''
    }, // or null
    zone_info: {
        zone_id: '',
        name: ''
    }, // or null (but it cannot be null)
    region_info: {
        region_id: '',
        name: ''
    }, // or null (but it cannot be null)
    project_id: '',
    domain_id: '',
    tags: {
        aa: ''
    },
    collect_info: {
        state: '',
        collectors: [],
        data_version: {}
    },
    created_at: {
        seconds: '',
        nanos: 0
    },
    updated_at: {
        seconds: '',
        nanos: 0
    },
    deleted_at: null
};
