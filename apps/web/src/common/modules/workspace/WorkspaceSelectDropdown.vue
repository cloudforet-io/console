<script setup lang="ts">

import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PSelectDropdown, PButton } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';


import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';

const router = useRouter();

const emit = defineEmits<{(e: 'select', value: SelectDropdownMenuItem[]): void;
    (e: 'update:selected-project-ids', value: SelectDropdownMenuItem[]): void;
}>();
const allReferenceStore = useAllReferenceStore();

interface Props {
    selectedWorkspaceIds?: SelectDropdownMenuItem[];
}
const props = withDefaults(defineProps<Props>(), {
    selectedWorkspaceIds: () => [],
});
const workspaceState = reactive({
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
    loading: true,
    visible: false,
    menuItems: [] as MenuItem[],
    selectedItems: useProxyValue('selectedWorkspaceIds', props, emit),
    searchText: '',
});

const workspaceListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true);
const fetchListWorkspaces = async (inputText: string) => {
    workspaceState.loading = true;
    workspaceListApiQueryHelper.setFilters([
        { k: 'name', v: inputText, o: '' },
        { k: 'state', v: 'ENABLED', o: '' },
    ]);
    try {
        const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
            query: workspaceListApiQueryHelper.data,
        });
        workspaceState.menuItems = (results ?? []).map((workspace) => ({
            label: workspace.name,
            name: workspace.workspace_id,
            tags: workspace.tags,
            is_dormant: workspace.is_dormant,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        workspaceState.loading = false;
    }
};
const workspaceMenuHandler: AutocompleteHandler = async (inputText: string) => {
    await fetchListWorkspaces(inputText);
    return {
        results: workspaceState.menuItems as SelectDropdownMenuItem[],
    };
};

watch(() => workspaceState.selectedItems, (selectedItems) => {
    emit('select', selectedItems);
}, { deep: true });

</script>

<template>
    <p-select-dropdown use-fixed-menu-style
                       :placeholder="$t('COMMON.WORKSPACE.SELECT_WORKSPACE')"
                       :visible-menu.sync="workspaceState.visible"
                       :loading="workspaceState.loading"
                       :search-text.sync="workspaceState.searchText"
                       :selected.sync="workspaceState.selectedItems"
                       :handler="workspaceMenuHandler"
                       parent-id="workspace-role-form"
                       show-select-marker
                       show-select-header
                       is-fixed-width
                       is-filterable
                       show-delete-all-button
                       class="workspace-select-dropdown"
                       :class="{'no-data': workspaceState.menuItems.length === 0 && !workspaceState.loading}"
    >
        <template #menu-item--format="{item}">
            <div class="menu-item-wrapper"
                 :class="{'is-dormant': item?.is_dormant}"
            >
                <div class="label">
                    <workspace-logo-icon :text="item?.label || ''"
                                         :theme="item?.tags?.theme"
                                         size="xs"
                    />
                    <span class="label-text">{{ item.label }}</span>
                    <p-status v-if="item?.is_dormant"
                              v-bind="workspaceStateFormatter(WORKSPACE_STATE.DORMANT)"
                              class="capitalize state"
                    />
                </div>
            </div>
        </template>
        <template #no-data-area>
            <p-empty v-if="workspaceState.menuItems.length === 0 && !workspaceState.loading"
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
                        {{ $t('IAM.USER.FORM.CREATE_WORKSPACE') }}
                    </p-button>
                </template>
                {{ $t('IAM.USER.FORM.NO_WORKSPACE') }}
            </p-empty>
        </template>
    </p-select-dropdown>
</template>

<style scoped lang="postcss">
.workspace-select-dropdown {
    .menu-item-wrapper {
        @apply flex justify-between;
        max-width: 100%;

        .label {
            @apply flex items-center gap-2;
        }
        .state {
            @apply text-label-sm;
        }
        .label-text {
            @apply truncate;
            max-width: 36.875rem;
        }
        &.is-dormant {
            .label-text {
                max-width: 31.25rem;
            }
        }
    }
}
</style>
