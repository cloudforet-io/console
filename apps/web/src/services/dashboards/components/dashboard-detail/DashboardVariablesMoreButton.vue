<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core';
import {
    computed,
    reactive, ref, toRef, toRefs, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { useMutation } from '@tanstack/vue-query';
import {
    cloneDeep, debounce,
} from 'lodash';

import { PButton, PContextMenu, useContextMenuController } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { DashboardGlobalVariable } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/constants/manage-variable-overlay-constant';
import { getOrderedGlobalVariables } from '@/services/dashboards/helpers/dashboard-global-variables-helper';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';

type DashboardModel = PrivateDashboardModel | PublicDashboardModel;
interface VariableMenuItem extends MenuItem {
    use?: boolean;
}
interface Props {
    isManageable?: boolean;
    disabled?: boolean;
    widgetMode?: boolean;
}

const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;

const router = useRouter();
const { getProperRouteLocation } = useProperRouteLocation();

/* Query */
const {
    keys,
    functions,
    queryClient,
} = useDashboardQuery();

const state = reactive({
    targetRef: null as HTMLElement | null,
    contextMenuRef: null as any | null,
    searchText: '',
    varsSchemaProperties: computed(() => ({})),
    variableList: computed<VariableMenuItem[]>(() => {
        const _refinedProperties: DashboardGlobalVariable[] = Object.values(dashboardDetailGetters.dashboardVarsSchemaProperties);
        const _orderedVariables = getOrderedGlobalVariables(_refinedProperties);
        return _orderedVariables.map((property) => ({
            name: property.key,
            label: property.name,
            use: property.use,
        }));
    }),
    selected: computed<VariableMenuItem[]>(() => state.variableList.filter((item) => item.use)),
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
const toggleUseDashboardVarsSchema = debounce((dashboardId: string, variableKey: string) => {
    const _dashboardVarsSchemaProperties: Record<string, DashboardGlobalVariable> = cloneDeep(dashboardDetailGetters.dashboardVarsSchemaProperties);
    const _use = !_dashboardVarsSchemaProperties[variableKey].use;
    const _vars = cloneDeep(dashboardDetailGetters.dashboardInfo?.vars || {});
    const _tempVars = cloneDeep(dashboardDetailState.vars);
    if (!_use) {
        delete _vars[variableKey];
        delete _tempVars[variableKey];
        dashboardDetailStore.setVars(_tempVars);
    }
    mutate({
        dashboard_id: dashboardId,
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
        mutationFn: functions.updateDashboardFn,
        onSuccess: (dashboard: DashboardModel) => {
            const isPrivate = dashboard.dashboard_id.startsWith('private');
            const dashboardListQueryKey = isPrivate ? keys.privateDashboardListQueryKey : keys.publicDashboardListQueryKey;
            queryClient.invalidateQueries({ queryKey: dashboardListQueryKey.value });
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
    router.push(getProperRouteLocation({
        name: DASHBOARDS_ROUTE.DETAIL._NAME,
        params: { dashboardId: dashboardDetailState.dashboardId ?? '' },
        hash: `#${MANAGE_VARIABLES_HASH_NAME}`,
    }));
};
const handleClickButton = () => {
    if (visibleMenu.value) hideContextMenu();
    else focusOnContextMenu();
};
const handleSelectVariable = (item: VariableMenuItem) => { // idx, isSelected
    if (!dashboardDetailState.dashboardId || !item.name || loading.value) return;
    toggleUseDashboardVarsSchema(dashboardDetailState.dashboardId, item.name);
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
            <template v-if="!dashboardDetailGetters.isDeprecatedDashboard && !props.widgetMode"
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
