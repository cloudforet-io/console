import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PublicFolderListParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/list';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type {
    ReferenceItem, ReferenceLoadOptions, ReferenceMap,
} from '@/store/reference/type';

interface PublicFolderResourceItemData {
    resourceGroup?: PublicFolderModel['resource_group'];
    projectId?: string;
    workspaceId?: string;
    shared?: boolean;
}
export type PublicFolderReferenceItem = Required<Pick<ReferenceItem<PublicFolderResourceItemData>, 'key'|'label'|'name'|'data'>>;
export type PublicFolderReferenceMap = ReferenceMap<PublicFolderReferenceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const usePublicFolderReferenceStore = defineStore('reference-folder', () => {
    const authorizationStore = useAuthorizationStore();
    const state = reactive({
        items: null as PublicFolderReferenceMap | null,
    });

    const getters = reactive({
        publicFolderItems: asyncComputed<PublicFolderReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        publicFolderTypeInfo: computed(() => ({
            type: 'public_folder',
            key: 'folder_id',
            name: 'Public Folder',
            referenceMap: getters.publicFolderItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const params: PublicFolderListParameters = {
            query: {
                only: ['folder_id', 'name', 'project_id', 'resource_group', 'workspace_id', 'shared'],
            },
        };
        const res = await SpaceConnector.clientV2.dashboard.publicFolder.list<PublicFolderListParameters, ListResponse<PublicFolderModel>>(params);

        const folderReferenceMap: PublicFolderReferenceMap = {};

        // eslint-disable-next-line no-restricted-syntax
        res?.results?.forEach((folderInfo) => {
            folderReferenceMap[folderInfo.folder_id] = {
                key: folderInfo.folder_id,
                label: folderInfo.name,
                name: folderInfo.name,
                data: {
                    resourceGroup: folderInfo?.resource_group,
                    projectId: folderInfo?.project_id,
                    workspaceId: folderInfo?.workspace_id,
                    shared: folderInfo?.shared,
                },
            };
        });

        state.items = folderReferenceMap;
        lastLoadedTime = currentTime;
    };

    const sync = async (folder: PublicFolderModel) => {
        state.items = {
            ...state.items,
            [folder.folder_id]: {
                key: folder.folder_id,
                label: folder.name,
                name: folder.name,
                data: {
                    resourceGroup: folder?.resource_group,
                    projectId: folder?.project_id,
                    workspaceId: folder?.workspace_id,
                    shared: folder?.shared,
                },
            },
        };
    };

    const flush = () => {
        state.items = null;
        lastLoadedTime = 0;
    };

    const actions = {
        load,
        sync,
        flush,
    };

    return {
        state,
        getters,
        ...actions,
    };
});

