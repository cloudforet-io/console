<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core';
import {
    computed,
    reactive, ref, toRef, toRefs, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PButton, PContextMenu, useContextMenuController } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import {
    cloneDeep, debounce, union, merge,
} from 'lodash';

import type { DashboardVariableSchemaProperty, DashboardVariablesSchema } from '@/schema/dashboard/_types/dashboard-type';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/constants/manage-variable-overlay-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-config-helper';


interface Props {
    isManageable?: boolean;
    disabled?: boolean;
}

const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const route = useRoute();
const router = useRouter();
const { getProperRouteLocation } = useProperRouteLocation();

const state = reactive({
    targetRef: null as HTMLElement | null,
    contextMenuRef: null as any | null,
    searchText: '',
    variableSchema: computed<DashboardVariablesSchema>(() => dashboardDetailState.variablesSchema),
    variableList: computed<MenuItem[]>(() => state.variableSchema.order.map((property) => {
        const currentProperty = state.variableSchema.properties[property];
        return ({
            name: property,
            label: currentProperty?.name ?? property,
            disabled: currentProperty?.fixed,
        });
    })),
    selected: computed<MenuItem[]>(() => {
        const result = [] as MenuItem[];
        state.variableSchema.order.forEach((property) => {
            const currentProperty = state.variableSchema.properties[property];
            if (!currentProperty?.use) return;
            result.push({ name: property, label: currentProperty.name, disabled: currentProperty.fixed });
        });
        return result;
    }),
    // uncheck custom variable
    uncheckConfirmModalVisible: false,
    selectedCustomVariable: undefined,
    affectedWidgetTitlesByCustomVariable: [] as string[],
    isClearSelectionCaseWithCustomVariableAffectingWidgets: false,
});

const {
    visibleMenu,
    refinedMenu,
    contextMenuStyle,
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

// helper
const getAffectedWidgetTitlesByCustomVariable = (targetProperty: string): string[] => {
    const widgetTitles: string[] = [];

    dashboardDetailState.dashboardWidgetInfoList.forEach((widgetInfo) => {
        const widgetConfig = getWidgetConfig(widgetInfo.widget_name);
        const inheritOptions = merge({}, widgetInfo.inherit_options);

        const isInherited = Object.values(inheritOptions)
            .some((d) => d.enabled && d.variable_key === targetProperty);
        if (isInherited) {
            widgetTitles.push(widgetInfo.title ?? widgetConfig.title as string);
        }
    });
    return widgetTitles;
};
const updateVariablesUse = (propertyName: string, isChecked: boolean) => {
    const property = state.variableSchema.properties[propertyName];
    if (!property) {
        console.error(new Error(`property is undefined: ${property}`));
        return;
    }
    if (property.use === isChecked) return;
    const _variablesSchema = cloneDeep(state.variableSchema);
    _variablesSchema.properties[propertyName].use = isChecked;
    dashboardDetailStore.setVariablesSchema(_variablesSchema);
};

const beforeSelect = (item: MenuItem, idx: number, isSelected: boolean): boolean => {
    const key = item.name;
    if (!key) return false;
    const property: DashboardVariableSchemaProperty|undefined = state.variableSchema.properties[key];
    if (!property) return false;
    if (property.fixed || property.readonly) return false;

    if (property.variable_type !== 'CUSTOM') return true;
    if (isSelected) return true;

    state.affectedWidgetTitlesByCustomVariable = getAffectedWidgetTitlesByCustomVariable(key);
    if (!state.affectedWidgetTitlesByCustomVariable.length) return true;

    state.selectedCustomVariable = key;
    state.uncheckConfirmModalVisible = true;
    return false;
};
const beforeClearSelection = (clearableItems: MenuItem[]): boolean => {
    if (!clearableItems.length) return true;

    const enabledCustomProperties = Object.entries<DashboardVariableSchemaProperty>(state.variableSchema.properties)
        .filter(([, v]) => v.variable_type === 'CUSTOM' && v.use && !v.fixed && !v.readonly);
    if (!enabledCustomProperties.length) return true;

    let affectedWidgetTitleSetByCustomVariable: string[] = [];
    enabledCustomProperties.forEach(([k]) => {
        affectedWidgetTitleSetByCustomVariable = union(affectedWidgetTitleSetByCustomVariable, getAffectedWidgetTitlesByCustomVariable(k));
    });

    if (!affectedWidgetTitleSetByCustomVariable.length) return true;

    state.affectedWidgetTitlesByCustomVariable = affectedWidgetTitleSetByCustomVariable;
    state.isClearSelectionCaseWithCustomVariableAffectingWidgets = true;
    state.uncheckConfirmModalVisible = true;
    return false;
};

// event
const handleOpenOverlay = () => {
    hideContextMenu();
    if (route.name === DASHBOARDS_ROUTE.CREATE._NAME) {
        router.push(getProperRouteLocation({
            name: DASHBOARDS_ROUTE.CREATE._NAME,
            hash: `#${MANAGE_VARIABLES_HASH_NAME}`,
        }));
    } else {
        router.push(getProperRouteLocation({
            name: DASHBOARDS_ROUTE.CUSTOMIZE._NAME,
            params: { dashboardId: dashboardDetailState.dashboardId ?? '' },
            hash: `#${MANAGE_VARIABLES_HASH_NAME}`,
        }));
    }
};
const handleClickButton = () => {
    if (visibleMenu.value) {
        hideContextMenu();
    } else {
        focusOnContextMenu();
    }
};

const handleSelectVariable = (item: MenuItem, idx: number, isSelected: boolean) => {
    if (!item.name) console.error(new Error(`item.name is undefined: ${item.name}`));
    else {
        updateVariablesUse(item.name ?? '', isSelected);
    }
    hideContextMenu();
    state.searchText = '';
};

const handleClearSelection = () => {
    const variablesSchema: DashboardVariablesSchema = cloneDeep(dashboardDetailState.variablesSchema);
    Object.keys(variablesSchema.properties).forEach((k) => {
        const property = variablesSchema.properties[k];
        if (property.readonly || property.fixed) return;
        property.use = false;
    });
    dashboardDetailStore.setVariablesSchema(variablesSchema);
    hideContextMenu();
    state.searchText = '';
};

const handleUpdateSearchText = debounce((text: string) => {
    state.searchText = text;
    reloadMenu();
}, 200);
const handleConfirmUncheckModal = () => {
    if (state.isClearSelectionCaseWithCustomVariableAffectingWidgets) {
        const _beforeProperties: DashboardVariablesSchema['properties'] = state.variableSchema.properties;
        const _afterPropertiesNames = state.selected.filter((d) => d.disabled).map((d) => d.name as string);
        Object.entries(_beforeProperties).forEach(([k, v]) => {
            if (v?.use && !_afterPropertiesNames.includes(k)) updateVariablesUse(k, false);
        });
        state.isClearSelectionCaseWithCustomVariableAffectingWidgets = false;
    } else updateVariablesUse(state.selectedCustomVariable, false);
    state.uncheckConfirmModalVisible = false;
    hideContextMenu();
    state.searchText = '';
};
const handleCancelUncheckModal = () => {
    state.isClearSelectionCaseWithCustomVariableAffectingWidgets = false;
    state.uncheckConfirmModalVisible = false;
};

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
                        :style="contextMenuStyle"
                        :menu="refinedMenu"
                        :selected="state.selected"
                        :before-select="beforeSelect"
                        :before-clear-selection="beforeClearSelection"
                        multi-selectable
                        show-select-marker
                        show-clear-selection
                        @click-show-more="showMoreMenu"
                        @keyup:down:end="focusOnContextMenu()"
                        @select="handleSelectVariable"
                        @clear-selection="handleClearSelection"
                        @update:search-text="handleUpdateSearchText"
        >
            <template #bottom>
                <p-button class="manage-variable-button"
                          style-type="secondary"
                          icon-left="ic_settings-filled"
                          :disabled="!props.isManageable"
                          @click="handleOpenOverlay"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.TITLE') }}
                </p-button>
            </template>
        </p-context-menu>
        <delete-modal :header-title="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.UNCHECK_MODAL_TITLE')"
                      :visible.sync="state.uncheckConfirmModalVisible"
                      @confirm="handleConfirmUncheckModal"
                      @cancel="handleCancelUncheckModal"
                      @close="handleCancelUncheckModal"
        >
            <p>
                <b>{{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.UNCHECK_MODAL_HELP_TEXT_1') }} </b>
                <span>{{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.UNCHECK_MODAL_HELP_TEXT_2') }}</span>
            </p>
            <div class="affected-widget-wrapper">
                <ul>
                    <li v-for="(title, idx) in state.affectedWidgetTitlesByCustomVariable"
                        :key="`affected-widget-${idx}`"
                    >
                        • {{ title }}
                    </li>
                </ul>
            </div>
        </delete-modal>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-variables-more-button {
    @apply inline-block;

    &.open-menu {
        @apply relative;
    }

    .variables-menu {

        .manage-variable-button {
            @apply w-full;
        }
    }

    /* custom design-system component - p-context-menu */
    :deep(.variables-menu) {
        .label-wrapper {
            min-width: 7rem;
            width: max-content;
            max-width: 22.5rem;
        }
    }

    .affected-widget-wrapper {
        @apply bg-gray-100 text-paragraph-md rounded;
        padding: 0.75rem;
        margin-top: 0.5rem;
    }
}
</style>
