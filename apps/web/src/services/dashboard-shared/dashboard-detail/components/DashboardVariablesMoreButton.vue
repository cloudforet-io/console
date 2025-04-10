<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core';
import {
    computed,
    reactive, ref, toRef, toRefs, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
    cloneDeep, debounce,
} from 'lodash';

import { PButton, PContextMenu, useContextMenuController } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { DashboardGlobalVariable } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import type {
    DashboardGlobalVariableSchemaProperties,
    DashboardModel,
} from '@/api-clients/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useDashboardRouteContext } from '@/services/dashboard-shared/_composables/use-dashboard-route-context';
import { useDashboardGetQuery } from '@/services/dashboard-shared/dashboard-detail/composables/use-dashboard-get-query';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboard-shared/dashboard-detail/constants/manage-variable-overlay-constant';
import { getOrderedGlobalVariables } from '@/services/dashboard-shared/dashboard-detail/helpers/dashboard-global-variables-helper';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

interface VariableMenuItem extends MenuItem {
    use?: boolean;
}
interface Props {
    dashboardId: string;
    isManageable?: boolean;
    disabled?: boolean;
    widgetMode?: boolean;
}

const props = defineProps<Props>();
const router = useRouter();
const dashboardId = computed(() => props.dashboardId);
const {
    entryPoint,
    projectGroupOrProjectId,
} = useDashboardRouteContext();

/* Query */
const {
    dashboard,
    fetcher,
    keys,
} = useDashboardGetQuery({
    dashboardId,
});
const queryClient = useQueryClient();
const state = reactive({
    targetRef: null as HTMLElement | null,
    contextMenuRef: null as any | null,
    searchText: '',
    dashboardVarsSchemaProperties: computed<DashboardGlobalVariableSchemaProperties>(() => dashboard.value?.vars_schema?.properties || {}),
    variableList: computed<VariableMenuItem[]>(() => {
        const _refinedProperties: DashboardGlobalVariable[] = Object.values(state.dashboardVarsSchemaProperties);
        const _orderedVariables = getOrderedGlobalVariables(_refinedProperties);
        return _orderedVariables.map((property) => ({
            name: property.key,
            label: property.name,
            use: property.use,
        }));
    }),
    selected: computed<VariableMenuItem[]>(() => state.variableList.filter((item) => item.use)),
    isDeprecatedDashboard: computed(() => dashboard.value?.version === '1.0'),
});

const {
    visibleMenu,
    refinedMenu,
    hideContextMenu,
    focusOnContextMenu,
    initiateMenu,
    reloadMenu,
    showMoreMenu,
} = useContextMenuController({
    targetRef: toRef(state, 'targetRef'),
    contextMenuRef: toRef(state, 'contextMenuRef'),
    useMenuFiltering: true,
    useReorderBySelection: true,
    searchText: toRef(state, 'searchText'),
    selected: toRef(state, 'selected'),
    menu: toRef(state, 'variableList'),
    pageSize: 10,
});

const containerRef = ref<HTMLElement|null>(null);
onClickOutside(containerRef, hideContextMenu);

/* Api */
const toggleUseDashboardVarsSchema = debounce((_dashboardId: string, variableKey: string) => {
    const _dashboardVarsSchemaProperties: Record<string, DashboardGlobalVariable> = cloneDeep(state.dashboardVarsSchemaProperties);
    const _use = !_dashboardVarsSchemaProperties[variableKey].use;
    const _vars = cloneDeep(dashboard.value?.vars || {});
    if (!_use) {
        delete _vars[variableKey];
    }
    mutate({
        dashboard_id: _dashboardId,
        vars_schema: {
            properties: {
                ..._dashboardVarsSchemaProperties,
                [variableKey]: {
                    ..._dashboardVarsSchemaProperties[variableKey],
                    use: !_dashboardVarsSchemaProperties[variableKey].use,
                },
            },
        },
        vars: _vars,
    });
}, 300);

const { mutate, isPending: loading } = useMutation(
    {
        mutationFn: fetcher.updateDashboardFn,
        onSuccess: (_dashboard: DashboardModel) => {
            const isPrivate = _dashboard.dashboard_id.startsWith('private');
            const dashboardQueryKey = isPrivate ? keys.privateDashboardGetQueryKey : keys.publicDashboardGetQueryKey;
            queryClient.setQueryData(dashboardQueryKey.value, (oldDashboard) => {
                if (!oldDashboard) return oldDashboard;
                return {
                    ...oldDashboard,
                    vars_schema: _dashboard.vars_schema,
                    vars: _dashboard.vars,
                };
            });
            showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_S_UPDATE_DASHBOARD_VARS_SCHEMA'), '');
        },
        onError: (e) => {
            ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_E_UPDATE_DASHBOARD_VARS_SCHEMA'));
        },
        onSettled() {
            hideContextMenu();
            state.searchText = '';
        },
    },
);

/* Event */
const handleOpenOverlay = () => {
    hideContextMenu();

    if (entryPoint.value === 'ADMIN') {
        router.push({
            name: ADMIN_DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: dashboardId.value,
            },
            hash: `#${MANAGE_VARIABLES_HASH_NAME}`,
        }).catch(() => {});
    } else if (entryPoint.value === 'PROJECT' && projectGroupOrProjectId.value) {
        router.push({
            name: PROJECT_ROUTE_V2._NAME,
            params: {
                projectGroupOrProjectId: projectGroupOrProjectId.value,
                dashboardId: dashboardId.value,
            },
            hash: `#${MANAGE_VARIABLES_HASH_NAME}`,
        }).catch(() => {});
    } else if (entryPoint.value === 'WORKSPACE') {
        router.push({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: dashboardId.value,
            },
            hash: `#${MANAGE_VARIABLES_HASH_NAME}`,
        }).catch(() => {});
    } else {
        console.error('Invalid entry point');
    }
};
const handleClickButton = () => {
    if (visibleMenu.value) hideContextMenu();
    else focusOnContextMenu();
};
const handleSelectVariable = (item: VariableMenuItem) => { // idx, isSelected
    if (!dashboardId.value || !item.name || loading.value) return;
    toggleUseDashboardVarsSchema(dashboardId.value, item.name);
};
const handleUpdateSearchText = debounce((text: string) => {
    state.searchText = text;
    reloadMenu();
}, 200);

watch(visibleMenu, (_visibleMenu) => {
    if (_visibleMenu) initiateMenu();
});

const {
    targetRef,
    contextMenuRef,
} = toRefs(state);

</script>

<template>
    <div ref="containerRef"
         class="dashboard-variables-more-button"
         :class="{'open-menu': visibleMenu}"
    >
        <p-button ref="targetRef"
                  icon-left="ic_plus_bold"
                  style-type="highlight"
                  :disabled="props.disabled"
                  @click="handleClickButton"
        >
            {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.MORE') }}
        </p-button>
        <p-context-menu v-show="visibleMenu"
                        ref="contextMenuRef"
                        class="variables-menu"
                        searchable
                        :search-text="state.searchText"
                        :menu="refinedMenu"
                        :selected="state.selected"
                        multi-selectable
                        show-select-marker
                        @click-show-more="showMoreMenu()"
                        @keyup:down:end="focusOnContextMenu()"
                        @select="handleSelectVariable"
                        @update:search-text="handleUpdateSearchText"
        >
            <template v-if="!state.isDeprecatedDashboard && !props.widgetMode"
                      #bottom
            >
                <p-button class="manage-variable-button"
                          style-type="secondary"
                          icon-left="ic_settings-filled"
                          @click="handleOpenOverlay"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.TITLE') }}
                </p-button>
            </template>
        </p-context-menu>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-variables-more-button {
    @apply inline-block;

    &.open-menu {
        @apply relative;
    }

    .variables-menu {
        z-index: 1000;
        .manage-variable-button {
            @apply w-full;
        }
    }
}
</style>
