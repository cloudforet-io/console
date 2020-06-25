import _ from 'lodash';
import {
    getEnumValues, getKeys, getValueHandler, makeValueHandlers, searchContextType,
} from '../query-search-bar/autocompleteHandler';
import { fluentApi } from '../../../../lib/fluent-api';
import { CONTEXT_MENU_TYPE } from '../../context-menu/context-menu/PContextMenu.toolset';


const HandlerMap = {
    key: [getKeys([
        'server_id',
        'name', 'state', 'primary_ip_address', 'server_type', 'os_type', 'project_id',
        'data.os.os_arch', 'data.os.os_details', 'data.os.os_version',
        'data.base.memory', 'data.base.core', 'data.platform.type',
        'data.compute.instance_name', 'data.compute.keypair', 'data.compute.instance_id',
        'collection_info.state',
    ])],
    value: [
        ...makeValueHandlers([
            'server_id', 'name', 'primary_ip_address',
            'data.compute.instance_name', 'data.compute.instance_id',
            'data.vm.vm_name', 'data.vm.vm_id',
        ], fluentApi
            .statisticsTest()
            .resource()
            .stat()
            .setResourceType('inventory.Server')),
        getEnumValues('state', ['PENDING', 'INSERVICE', 'MAINTENANCE', 'CLOSED', 'DELETED']),
        getEnumValues('os_type', ['LINUX', 'WINDOWS']),
        getEnumValues('collection_info.state', ['MANUAL', 'ACTIVE', 'DISCONNECTED']),
        getEnumValues('server_type', ['BAREMETAL', 'VM', 'HYPERVISOR', 'UNKNOWN']),
        getValueHandler('project_id', fluentApi
            .statisticsTest()
            .resource()
            .stat()
            .setResourceType('identity.Project')),
    ],
};

const makeItem = value => (typeof value === 'object' ? value : { type: CONTEXT_MENU_TYPE.item, label: value, name: value });

const makeContextMenu = (data) => {
    let result = [{ type: CONTEXT_MENU_TYPE.divider }];
    const title = data[0] ? [{ type: CONTEXT_MENU_TYPE.header, label: data[0] }] : [];
    result = result.concat(title);
    const menus = data[1];
    if (menus && menus.length >= 1) {
        const menuItems = _.flatMap(menus, makeItem);
        return result.concat(menuItems);
    }
    return [];
};

export const apiHandler = {
    async getAutoCompleteData(contextType, inputText, searchQuery) {
        const result = [];
        let handlers = [];
        if (contextType === searchContextType.Key) {
            handlers = HandlerMap.key;
        } else if (contextType === searchContextType.Value) {
            handlers = HandlerMap.value;
        }
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            // eslint-disable-next-line no-await-in-loop
            result.push(...makeContextMenu(await handler(contextType, inputText, searchQuery)));
        }
        if (result.length >= 1 && _.head(result).type === CONTEXT_MENU_TYPE.divider) {
            return result.slice(1);
        }
        return result;
    },
};


export const mockHandler = {
    async getAutoCompleteData(contextType, inputText, searchQuery) {
        const result = [];
        let handlers = [];
        if (contextType === searchContextType.Key) {
            handlers = HandlerMap.key;
        } else if (contextType === searchContextType.Value) {
            handlers = HandlerMap.value;
        }
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            // eslint-disable-next-line no-await-in-loop
            result.push(...makeContextMenu(await handler(contextType, inputText, searchQuery)));
        }
        if (result.length >= 1 && _.head(result).type === CONTEXT_MENU_TYPE.divider) {
            return result.slice(1);
        }
        return result;
    },
};
