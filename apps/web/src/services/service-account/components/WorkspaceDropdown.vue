<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router/composables';


import { PSelectDropdown, PStatus } from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { useResourceMenuHandlerMap } from '@/query/resource-query/resource-menu-handler';

import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';


const PAGE_SIZE = 10;

const props = withDefaults(defineProps<{
    selected?: string;
    disabled?: boolean;
}>(), {
    selected: '',
    disabled: false,
});

const emit = defineEmits<{(e: 'update', target: string): void; }>();
const dropdownRef = ref<InstanceType<typeof PSelectDropdown>>();
const router = useRouter();

const resourceMenuHandler = useResourceMenuHandlerMap();
const referenceMap = useAllReferenceDataModel();
const workspaceMap = referenceMap.workspace;

const state = reactive({
    workspaceMenuHandler: resourceMenuHandler.workspace({
        menuFilters: [
            { k: 'state', v: WORKSPACE_STATE.ENABLE, o: '=' },
            { k: 'is_dormant', v: false, o: '=' },
        ],
    }),
    selected: computed<SelectDropdownMenuItem[]|undefined>(() => {
        if (!props.selected) return [];
        const selectedItem = workspaceMap[props.selected];
        if (!selectedItem) return [];
        return [
            {
                name: props.selected,
                label: selectedItem?.label,
            },
        ];
    }),
});


const handleClickCreateButton = () => {
    window.open(router.resolve({ name: ADMIN_ADVANCED_ROUTE.WORKSPACES._NAME }).href);
};

const handleSelectWorkspace = (selected:SelectDropdownMenuItem) => {
    emit('update', selected.name);
};

</script>

<template>
    <p-select-dropdown ref="dropdownRef"
                       class="workspace-dropdown"
                       :disabled="props.disabled"
                       :handler="state.workspaceMenuHandler"
                       :placeholder="$t('Select a workspace')"
                       :selected="state.selected"
                       use-fixed-menu-style
                       is-fixed-width
                       is-filterable
                       :page-size="PAGE_SIZE"
                       @click-button="handleClickCreateButton"
                       @select="handleSelectWorkspace"
    >
        <template #dropdown-left-area>
            <div v-if="state.selected.length > 0">
                <workspace-logo-icon :text="workspaceMap[props.selected]?.label || ''"
                                     :theme="workspaceMap[props.selected]?.data?.tags?.theme"
                                     size="xs"
                />
            </div>
        </template>
        <template #menu-item--format="{item}">
            <div class="menu-item-wrapper">
                <div class="label">
                    <workspace-logo-icon :text="item?.label || ''"
                                         :theme="item?.data?.tags?.theme"
                                         size="xs"
                    />
                    <span class="label-text">{{ item.label }}</span>
                    <p-status v-if="item?.data?.is_dormant"
                              v-bind="workspaceStateFormatter(WORKSPACE_STATE.DORMANT)"
                              class="capitalize state"
                    />
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
        .state {
            @apply text-label-sm;
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
