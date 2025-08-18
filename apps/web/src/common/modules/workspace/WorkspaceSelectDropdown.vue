<script setup lang="ts">

import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PEmpty, PSelectDropdown, PButton, PStatus,
} from '@cloudforet/mirinae';
import type {
    SelectDropdownMenuItem,
} from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import { useResourceMenuHandlerMap } from '@/query/resource-query/resource-menu-handler';

import { useProxyValue } from '@/common/composables/proxy-state';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';

const PAGE_SIZE = 10;

interface Emits {
    (e: 'update:selected-workspace-ids', value: SelectDropdownMenuItem[]): void;
}

const router = useRouter();

const emit = defineEmits<Emits>();

interface Props {
    selectedWorkspaceIds?: SelectDropdownMenuItem[];
}
const props = withDefaults(defineProps<Props>(), {
    selectedWorkspaceIds: () => [],
});

const resourceMenuHandlerMap = useResourceMenuHandlerMap();
const workspaceHandler = computed(() => resourceMenuHandlerMap.workspace({
    menuFilters: [{
        k: 'state',
        v: 'ENABLED',
        o: '=',
    }],
}));


const workspaceState = reactive({
    selectedItems: useProxyValue('selectedWorkspaceIds', props, emit),
});

</script>

<template>
    <p-select-dropdown use-fixed-menu-style
                       :placeholder="$t('COMMON.WORKSPACE.SELECT_WORKSPACE')"
                       :handler="workspaceHandler"
                       :selected.sync="workspaceState.selectedItems"
                       is-filterable
                       is-fixed-width
                       show-select-marker
                       show-select-header
                       :page-size="PAGE_SIZE"
                       class="workspace-select-dropdown"
    >
        <template #menu-item--format="{item}">
            <div class="menu-item-wrapper"
                 :class="{'is-dormant': item?.data?.is_dormant}"
            >
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
        <template #no-data-area>
            <p-empty image-size="sm"
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
