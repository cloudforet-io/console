<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core';
import {
    computed,
    reactive, ref, toRef, toRefs, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    cloneDeep, debounce,
} from 'lodash';

import { PButton, PContextMenu, useContextMenuController } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { DashboardGlobalVariable } from '@/schema/dashboard/_types/dashboard-global-variable-type';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/constants/manage-variable-overlay-constant';
import { getOrderedGlobalVariables } from '@/services/dashboards/helpers/dashboard-global-variables-helper';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';



interface VariableMenuItem extends MenuItem {
    use?: boolean;
}
interface Props {
    isManageable?: boolean;
    disabled?: boolean;
    widgetMode?: boolean;
}

const props = defineProps<Props>();

const dashboardStore = useDashboardStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;

const router = useRouter();
const { getProperRouteLocation } = useProperRouteLocation();

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
const toggleUseDashboardVarsSchema = debounce(async (dashboardId: string, variableKey: string) => {
    try {
        const _dashboardVarsSchemaProperties: Record<string, DashboardGlobalVariable> = cloneDeep(dashboardDetailGetters.dashboardVarsSchemaProperties);
        const _use = !_dashboardVarsSchemaProperties[variableKey].use;
        const _vars = cloneDeep(dashboardDetailGetters.dashboardInfo?.vars || {});
        const _tempVars = cloneDeep(dashboardDetailState.vars);
        if (!_use) {
            delete _vars[variableKey];
            delete _tempVars[variableKey];
            dashboardDetailStore.setVars(_tempVars);
        }
        await dashboardStore.updateDashboard(dashboardId, {
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
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_S_UPDATE_DASHBOARD_VARS_SCHEMA'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_E_UPDATE_DASHBOARD_VARS_SCHEMA'));
    }
}, 300);

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
const handleSelectVariable = async (item: VariableMenuItem) => { // idx, isSelected
    if (!dashboardDetailState.dashboardId || !item.name) return;
    await toggleUseDashboardVarsSchema(dashboardDetailState.dashboardId, item.name);
    hideContextMenu();
    state.searchText = '';
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
