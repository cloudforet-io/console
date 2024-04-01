<script setup lang="ts">

import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PButton, PSelectDropdown } from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/src/inputs/dropdown/select-dropdown/type';
import { debounce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';

const PAGE_SIZE = 4;

const props = withDefaults(defineProps<{
    selected?: string;
    disabled?: boolean;
}>(), {
    selected: '',
    disabled: false,
});

const emit = defineEmits<{(e: 'update', target: string): void; }>();

const router = useRouter();

const state = reactive({
    loading: false,
    isShowMore: computed(() => state.workspaceList.length < state.totalCount),
    workspaceList: [],
    workspaceMenuList: computed<SelectDropdownMenuItem[]>(() => {
        const menuList = [
            ...(state.workspaceList ?? []).map((_workspace) => ({
                name: _workspace.workspace_id,
                label: _workspace.name,
                tags: _workspace.tags,
            })),
            { type: 'button', label: 'Create', name: 'create' },
        ];
        if (state.isShowMore) {
            menuList.push({ type: 'showMore' });
        }
        return menuList;
    }),
    searchText: '',
    totalCount: 0,
    pageStart: 1,
    pageLimit: PAGE_SIZE,
});

const fetchWorkspace = async (searchText?:string) => {
    try {
        state.loading = true;
        const { results, total_count } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
            query: {
                keyword: searchText ?? state.searchText,
                page: {
                    start: state.pageStart,
                    limit: state.pageLimit,
                },
            },
        });
        state.totalCount = total_count;
        return results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.totalCount = 0;
        return [];
    } finally {
        state.loading = false;
    }
};
const handleClickReloadButton = async () => {
    state.pageStart = 1;
    state.workspaceList = await fetchWorkspace();
};

const handleClickCreateButton = () => {
    window.open(router.resolve({ name: makeAdminRouteName(PREFERENCE_ROUTE.WORKSPACES._NAME) }).href);
};

const handleClickShowMore = async () => {
    state.pageStart += PAGE_SIZE;
    const additionalWorkspaceList = await fetchWorkspace();
    state.workspaceList = state.workspaceList.concat(additionalWorkspaceList);
};

const handleUpdateSearchText = async (searchText:string) => {
    state.searchText = searchText;
};

const handleSelectWorkspace = (selected:string) => {
    emit('update', selected);
};

(async () => {
    state.workspaceList = await fetchWorkspace();
})();

watch(() => state.searchText, debounce(async (searchText) => {
    if (searchText) {
        state.pageStart = 1;
        state.workspaceList = await fetchWorkspace(searchText);
    }
}, 300));
</script>

<template>
    <p-select-dropdown class="workspace-dropdown"
                       :disabled="props.disabled"
                       :menu="state.workspaceMenuList"
                       :loading="state.loading"
                       disable-handler
                       use-fixed-menu-style
                       is-filterable
                       @click-button="handleClickCreateButton"
                       @click-show-more="handleClickShowMore"
                       @update:search-text="handleUpdateSearchText"
                       @update:selected="handleSelectWorkspace"
    >
        <template #context-menu-header>
            <div class="context-menu-header">
                <p-button style-type="tertiary"
                          icon-left="ic_refresh"
                          size="sm"
                          @click="handleClickReloadButton"
                >
                    {{ $t('INVENTORY.COLLECTOR.CREATE.RELOAD') }}
                </p-button>
            </div>
        </template>

        <template #menu-item--format="{item}">
            <div class="menu-item-wrapper">
                <div class="label">
                    <workspace-logo-icon :text="item?.label || ''"
                                         :theme="item?.tags?.theme"
                                         size="xs"
                    />
                    <span class="label-text">{{ item.label }}</span>
                </div>
            </div>
        </template>
    </p-select-dropdown>
</template>

<style scoped lang="postcss">
.workspace-dropdown {
    width: 30rem;

    .menu-item-wrapper {
        @apply flex justify-between;
        max-width: 18rem;

        .label {
            @apply flex items-center gap-2;
        }
        .label-text {
            @apply truncate;
            max-width: 16.25rem;
        }
    }

    .context-menu-header {
        padding: 0.5rem 0 0.25rem 0.5rem;
    }
}

@screen mobile {
    .workspace-dropdown {
        width: 100%;
    }
}

</style>
