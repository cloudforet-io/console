<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PSelectDropdown, PBadge, PEmpty, PButton, PTextHighlighting, PStatus,
} from '@cloudforet/mirinae';
import type { AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';
import { ADMIN_INFO_ROUTE } from '@/services/info/routes/admin/route-constant';
import type { WorkspaceDropdownMenuItem, NoticeFormType } from '@/services/info/types/notice-type';

interface Props {
    selectedItems: WorkspaceDropdownMenuItem[];
    type?: NoticeFormType;
}

const props = withDefaults(defineProps<Props>(), {
    selectedItems: () => ([]),
    type: undefined,
});

const router = useRouter();
const route = useRoute();

const emit = defineEmits<{(e: 'refresh', inputText: string): void;
    (e: 'selected-items', inputText: string): void;
}>();

const state = reactive({
    loading: true,
    visible: false,
    proxySelectedItems: useProxyValue('selectedItems', props, emit),
    searchText: '',
    menuItems: [] as WorkspaceDropdownMenuItem[],
    isMainListPage: computed<boolean>(() => route.name === ADMIN_INFO_ROUTE.NOTICE._NAME),
});

const handleSelectedItem = (value: WorkspaceDropdownMenuItem[]) => {
    state.proxySelectedItems = value;
};

const workspaceListApiQueryHelper = new ApiQueryHelper();

const workspaceMenuHandler: AutocompleteHandler = async (inputText: string, pageStart = 1, pageLimit = 10) => {
    state.loading = true;

    workspaceListApiQueryHelper
        .setSort('name', true)
        .setFilters([
            { k: 'name', v: inputText, o: '' },
            { k: 'state', v: WORKSPACE_STATE.ENABLE, o: '' },
            { k: 'is_dormant', v: false, o: '' },
        ]);
    try {
        const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
            query: workspaceListApiQueryHelper.data,
        });
        const refinedMenuItems = (results ?? []).map((workspace) => ({
            label: workspace.name,
            name: workspace.workspace_id,
            tags: workspace.tags,
            is_dormant: workspace.is_dormant,
        }));
        const totalCount = pageStart - 1 + Number(pageLimit);
        const slicedResults = refinedMenuItems?.slice(pageStart - 1, totalCount);
        state.menuItems = slicedResults;
        return {
            results: slicedResults,
            more: totalCount < refinedMenuItems.length,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            results: [],
            more: false,
        };
    } finally {
        state.loading = false;
    }
};

(() => {
    if (props.type === 'EDIT') return;
    state.proxySelectedItems = [];
})();
</script>

<template>
    <div class="notice-workspace-dropdown-wrapper">
        <p-select-dropdown :visible-menu.sync="state.visible"
                           use-fixed-menu-style
                           :loading="state.loading"
                           :search-text.sync="state.searchText"
                           :selected="state.proxySelectedItems"
                           :handler="workspaceMenuHandler"
                           show-select-marker
                           is-filterable
                           is-fixed-width
                           :page-size="10"
                           multi-selectable
                           appearance-type="badge"
                           show-delete-all-button
                           class="notice-workspace-dropdown"
                           :class="{'no-data': state.menuItems.length === 0 && !state.loading, 'is-main': state.isMainListPage }"
                           @update:selected="handleSelectedItem"
        >
            <template #dropdown-button>
                <div v-if="state.proxySelectedItems.length > 0"
                     class="selected-workspace-wrapper"
                >
                    <workspace-logo-icon :text="state.proxySelectedItems[0].label || ''"
                                         :theme="state.proxySelectedItems[0].tags?.theme"
                                         size="xxs"
                    />
                    <span class="label">{{ state.proxySelectedItems[0].label }}</span>
                    <p-badge v-if="state.proxySelectedItems.length > 1"
                             style-type="blue200"
                             badge-type="subtle"
                             class="badge"
                    >
                        + {{ state.proxySelectedItems.length - 1 }}
                    </p-badge>
                </div>
                <span v-else
                      class="placeholder"
                >
                    {{ $t('INFO.NOTICE.FORM.SELECT') }}
                </span>
            </template>
            <template #menu-item--format="{item}">
                <div class="menu-item-wrapper">
                    <workspace-logo-icon :text="item?.label || ''"
                                         :theme="item?.tags?.theme"
                                         size="xxs"
                    />
                    <p-text-highlighting class="label-text"
                                         :text="item.label"
                                         :term="state.searchText"
                    />
                    <p-status v-if="item?.is_dormant"
                              v-bind="workspaceStateFormatter(WORKSPACE_STATE.DORMANT)"
                              class="capitalize state"
                    />
                </div>
            </template>
            <template #no-data-area>
                <p-empty v-if="state.menuItems.length === 0 && !state.loading"
                         image-size="sm"
                         show-image
                         show-button
                         class="no-data-wrapper"
                >
                    <template #image>
                        <img src="@/assets/images/illust_planet.svg"
                             alt="empty-options"
                        >
                    </template>
                    <template #button>
                        <p-button style-type="substitutive"
                                  icon-left="ic_plus_bold"
                                  @click="router.push({ name: ADMIN_ADVANCED_ROUTE.WORKSPACES._NAME })"
                        >
                            {{ $t('INFO.NOTICE.FORM.CREATE_WORKSPACE') }}
                        </p-button>
                    </template>
                    {{ $t('INFO.NOTICE.FORM.NO_WORKSPACE') }}
                </p-empty>
            </template>
        </p-select-dropdown>
    </div>
</template>

<style scoped lang="postcss">
.notice-workspace-dropdown-wrapper {
    .notice-workspace-dropdown {
        margin-top: 0.25rem;
        &.is-main {
            .menu-item-wrapper {
                .label-text {
                    max-width: 16.375rem;
                }
            }
        }
        .no-data-wrapper {
            margin-top: 2rem;
            margin-bottom: 2rem;
        }
        .menu-item-wrapper {
            @apply flex items-center;
            gap: 0.25rem;
            .label-text {
                @apply truncate;
                flex: 1;
                max-width: 30.25rem;
            }
            .state {
                @apply text-label-sm;
            }
        }
        .selected-workspace-wrapper {
            @apply flex items-center;
            width: 100%;
            gap: 0.25rem;
            .label {
                @apply truncate;
            }
            .badge {
                min-width: 2.125rem;
            }
        }
        .placeholder {
            @apply text-gray-600;
        }
    }
}
</style>

