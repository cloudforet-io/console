/* eslint-disable camelcase */

import { KeyItem } from '@/components/organisms/search/query-search/type';
import { get } from 'lodash';

const data = {
    monitor: {
        resource_id: 'subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/providers/Microsoft.Compute/virtualMachines'
            + '/jiyoon-vm-2-for-backend-pool',
    },
    compute: {
        keypair: 'azureuser',
        instance_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/providers/Microsoft.Compute/virtualMachines/jiyoon-vm-2-for-backend-pool',
        instance_type: 'Standard_D2s_v3',
        tags: { vm_id: 'cb014cbe-2244-4956-bcd7-1456c432605d' },
        instance_state: 'RUNNING',
        launched_at: '2020-11-26T07:56:19.760473+0000',
        security_groups: [{
            name: 'jiyoon-vm-2-for-backend-pool-nsg',
            display: 'jiyoon-vm-2-for-backend-pool-nsg',
            id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/providers/Microsoft.Network/networkSecurityGroups'
                + '/jiyoon-vm-2-for-backend-pool-nsg',
        }],
        az: 'southeastasia',
        image: '/Subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/Providers/Microsoft.Compute/Locations/'
            + 'southeastasia/Publishers/Canonical/ArtifactTypes/VMImage/Offers/UbuntuServer/Skus/18.04-LTS/Versions/18.04.202011230',
        account: 'Azure subscription 1',
        instance_name: 'jiyoon-vm-2-for-backend-pool',
    },
    vnet: {
        cidr: '10.0.11.0/24',
        vnet_name: 'jiyoon_rg1-vnet',
        vnet_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/providers/Microsoft.Network/virtualNetworks/jiyoon_rg1-vnet',
    },
    resource_group: {
        resource_group_name: 'jiyoon_rg1',
        resource_group_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1',
    },
    subnet: {
        subnet_name: 'default',
        cidr: '10.0.11.0/24',
        subnet_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/providers/Microsoft.Network/virtualNetworks/jiyoon_rg1-vnet/subnets/default',
    },
    subscription: {
        tenant_id: '35f43e22-0c0b-4ff3-90aa-b2c04ef1054c',
        subscription_id: '3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca',
        subscription_name: 'Azure subscription 1',
    },
    os: { os_distro: 'ubuntu', os_arch: 'x86_64', details: 'Canonical, UbuntuServer, 18.04-LTS' },
    security_group: [{
        port_range_min: 443,
        remote_cidr: '*',
        remote: '*',
        port_range_max: 443,
        remote_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1'
            + '/providers/Microsoft.Network/networkSecurityGroups/jiyoon-vm-2-for-backend-pool-nsg/securityRules/HTTPS',
        security_group_name: 'jiyoon-vm-2-for-backend-pool-nsg',
        port: '443',
        description: null,
        security_group_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/providers'
            + '/Microsoft.Network/networkSecurityGroups/jiyoon-vm-2-for-backend-pool-nsg',
        priority: 300,
        action: 'allow',
        direction: 'inbound',
        protocol: 'TCP',
    }, {
        remote_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/'
            + 'providers/Microsoft.Network/networkSecurityGroups/jiyoon-vm-2-for-backend-pool-nsg/defaultSecurityRules/AllowVnetInBound',
        remote: 'VirtualNetwork',
        port_range_max: 0,
        direction: 'inbound',
        protocol: 'ALL',
        action: 'allow',
        priority: 65000,
        port: '*',
        security_group_name: 'jiyoon-vm-2-for-backend-pool-nsg',
        security_group_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/]'
            + 'providers/Microsoft.Network/networkSecurityGroups/jiyoon-vm-2-for-backend-pool-nsg',
        description: 'Allow inbound traffic from all VMs in VNET',
        port_range_min: 0,
    }, {
        remote: 'AzureLoadBalancer',
        security_group_name: 'jiyoon-vm-2-for-backend-pool-nsg',
        remote_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/'
            + 'providers/Microsoft.Network/networkSecurityGroups/jiyoon-vm-2-for-backend-pool-nsg/'
            + 'defaultSecurityRules/AllowAzureLoadBalancerInBound',
        port_range_max: 0,
        action: 'allow',
        security_group_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/'
            + 'providers/Microsoft.Network/networkSecurityGroups/jiyoon-vm-2-for-backend-pool-nsg',
        port_range_min: 0,
        protocol: 'ALL',
        priority: 65001,
        port: '*',
        direction: 'inbound',
        description: 'Allow inbound traffic from azure load balancer',
    }, {
        remote_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/'
            + 'jiyoon_rg1/providers/Microsoft.Network/networkSecurityGroups/jiyoon-vm-2-for-backend-pool-nsg/defaultSecurityRules/DenyAllInBound',
        port_range_min: 0,
        action: 'deny',
        description: 'Deny all inbound traffic',
        remote_cidr: '*',
        direction: 'inbound',
        security_group_name: 'jiyoon-vm-2-for-backend-pool-nsg',
        remote: '*',
        port_range_max: 0,
        priority: 65500,
        port: '*',
        protocol: 'ALL',
        security_group_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/'
            + 'providers/Microsoft.Network/networkSecurityGroups/jiyoon-vm-2-for-backend-pool-nsg',
    }, {
        direction: 'outbound',
        port_range_max: 0,
        port_range_min: 0,
        port: '*',
        protocol: 'ALL',
        security_group_name: 'jiyoon-vm-2-for-backend-pool-nsg',
        remote: 'VirtualNetwork',
        action: 'allow',
        priority: 65000,
        remote_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups'
            + '/jiyoon_rg1/providers/Microsoft.Network/networkSecurityGroups/jiyoon-vm-2-for-backend-pool-nsg'
            + '/defaultSecurityRules/AllowVnetOutBound',
        description: 'Allow outbound traffic from all VMs to all VMs in VNET',
        security_group_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1'
            + '/providers/Microsoft.Network/networkSecurityGroups/jiyoon-vm-2-for-backend-pool-nsg',
    }, {
        description: 'Allow outbound traffic from all VMs to Internet',
        remote_cidr: '*',
        security_group_name: 'jiyoon-vm-2-for-backend-pool-nsg',
        port_range_min: 0,
        security_group_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/'
            + 'providers/Microsoft.Network/networkSecurityGroups/jiyoon-vm-2-for-backend-pool-nsg',
        remote_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/providers'
            + '/Microsoft.Network/networkSecurityGroups/jiyoon-vm-2-for-backend-pool-nsg/defaultSecurityRules/AllowInternetOutBound',
        remote: '*',
        port: '*',
        action: 'allow',
        protocol: 'ALL',
        direction: 'outbound',
        priority: 65001,
        port_range_max: 0,
    }, {
        security_group_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/'
            + 'providers/Microsoft.Network/networkSecurityGroups/jiyoon-vm-2-for-backend-pool-nsg',
        remote: '*',
        remote_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/providers'
            + '/Microsoft.Network/networkSecurityGroups/jiyoon-vm-2-for-backend-pool-nsg/defaultSecurityRules/DenyAllOutBound',
        port: '*',
        security_group_name: 'jiyoon-vm-2-for-backend-pool-nsg',
        description: 'Deny all outbound traffic',
        action: 'deny',
        remote_cidr: '*',
        port_range_max: 0,
        priority: 65500,
        port_range_min: 0,
        direction: 'outbound',
        protocol: 'ALL',
    }],
    hardware: { memory: 8, core: 2 },
    load_balancer: [{
        scheme: 'internal',
        type: 'network',
        tags: { lb_id: '/subscriptions/3ec64e1e-1ce8-4f2c-82a0-a7f6db0899ca/resourceGroups/jiyoon_rg1/providers/Microsoft.Network/loadBalancers/jiyoon_load_balancer_1' },
        name: 'jiyoon_load_balancer_1',
        port: [80],
        protocol: ['TCP'],
        endpoint: '10.0.11.5',
    }],
    azure: {
        ultra_ssd_enabled: false, priority: 'Regular', tags: [], boot_diagnostics: true, write_accelerator_enabled: false,
    },
    wanjin: null,
};


const getMenuType = (d) => {
    if (d === undefined || d === null) {
        return {
            dataType: 'string',
            results: [],
        };
    }
    if (typeof d === 'string') {
        return {
            dataType: 'string',
            results: [],
        };
    } if (typeof d === 'boolean') {
        return {
            dataType: 'boolean',
            results: [],
        };
    } if (typeof d === 'number') {
        let dt;
        if (Math.floor(d) !== d) dt = 'float';
        else dt = 'integer';
        return {
            dataType: dt,
            results: [],
        };
    } if (Array.isArray(d)) {
        return {
            dataType: 'object',
            results: d.map((dt, k) => ({ label: k.toString(), name: k.toString() })),
        };
    }
    return {
        dataType: 'object',
        results: Object.keys(d).map(k => ({ label: k, name: k })),
    };
};

export const objHandler = async (inputText: string, keyItem: KeyItem) => {
    const regex = RegExp(inputText || '', 'i');
    try {
        let resp: any = data;
        if (keyItem.subPaths) resp = get(data, keyItem.subPaths, undefined);

        resp = getMenuType(resp);

        return {
            results: resp.results.filter(d => regex.test(d.name)).slice(0, 10),
            totalCount: resp.results.length,
        };
    } catch (e) {
        return {
            results: [],
            totalCount: 0,
        };
    }
};
