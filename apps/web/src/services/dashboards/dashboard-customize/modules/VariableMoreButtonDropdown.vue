<template>
    <div ref="containerRef"
         class="variable-more-button-dropdown"
         :class="{'open-menu': visibleMenu}"
    >
        <p-button ref="targetRef"
                  icon-left="ic_plus_bold"
                  style-type="highlight"
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
                        multi-selectable
                        show-select-marker
                        show-clear-selection
                        @click-show-more="showMoreMenu"
                        @keyup:down:end="focusOnContextMenu()"
                        @update:selected="handleSelectVariable"
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

<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core';
import {
    computed,
    reactive, ref, toRef, toRefs, watch,
} from 'vue';

import { PButton, PContextMenu, useContextMenuController } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep, debounce } from 'lodash';

import { SpaceRouter } from '@/router';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/config';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';


interface Props {
    isManageable: boolean;
}

const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const state = reactive({
    targetRef: null as HTMLElement | null,
    contextMenuRef: null as any | null,
    searchText: '',
    variableSchema: computed<DashboardVariablesSchema>(() => dashboardDetailState.variablesSchema),
    variableList: computed<MenuItem[]>(() => state.variableSchema.order.map((property) => {
        const currentProperty = state.variableSchema.properties[property];
        return ({
            name: property, label: currentProperty?.name ?? property,
        });
    })),
    selected: computed<MenuItem[]>(() => {
        const result = [] as MenuItem[];
        state.variableSchema.order.forEach((property) => {
            const currentProperty = state.variableSchema.properties[property];
            if (!currentProperty?.use) return;
            result.push({ name: property, label: currentProperty.name, disabled: currentProperty.disabled });
        });
        return result;
    }),
    // uncheck custom variable
    uncheckConfirmModalVisible: false,
    selectedCustomVariable: undefined,
    affectedWidgetTitlesByCustomVariable: [] as string[],
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
const _getAffectedWidgetTitlesByCustomVariable = (targetProperty: string): string[] => {
    const widgetTitles: string[] = [];
    dashboardDetailState.dashboardWidgetInfoList.forEach((widgetInfo) => {
        const widgetInheritVariableKeys = Object.values(widgetInfo.inherit_options).filter((d) => d.enabled).map((d) => d.variable_info?.key);
        if (widgetInheritVariableKeys.includes(targetProperty)) {
            widgetTitles.push(widgetInfo.title);
        }
    });
    return widgetTitles;
};
const _updateVariablesUse = (property: string, isChecked: boolean) => {
    const _variablesSchema = cloneDeep(state.variableSchema);
    _variablesSchema.properties[property].use = isChecked;
    dashboardDetailStore.$patch((_state) => {
        _state.variablesSchema = _variablesSchema;
    });
};
const _toggleDashboardVariableUse = () => {
    /*
     * when variable is unchecked,
     * managed variable: delete variable from each widget & set default value if it's required option
     * custom variable: show warning modal
     */
    const _beforeProperties: DashboardVariablesSchema['properties'] = state.variableSchema.properties;
    const _afterPropertyNames: string[] = state.selected.map((d) => d.name);
    Object.entries(_beforeProperties).forEach(([k, v]) => {
        if (v?.use && !_afterPropertyNames.includes(k)) { /* uncheck case */
            if (dashboardDetailState.variablesSchema.properties[k]?.variable_type === 'CUSTOM') { /* custom variable case */
                state.affectedWidgetTitlesByCustomVariable = _getAffectedWidgetTitlesByCustomVariable(k);
                if (state.affectedWidgetTitlesByCustomVariable) {
                    state.selectedCustomVariable = k;
                    state.uncheckConfirmModalVisible = true;
                } else {
                    _updateVariablesUse(k, false);
                }
            } else { /* manged variable case */
                _updateVariablesUse(k, false);
            }
        } else if (!v?.use && _afterPropertyNames.includes(k)) { /* check case */
            _updateVariablesUse(k, true);
        }
    });
};

// event
const handleOpenOverlay = () => {
    hideContextMenu();
    SpaceRouter.router.push({
        name: dashboardDetailStore.isProjectDashboard ? DASHBOARDS_ROUTE.PROJECT.CUSTOMIZE._NAME : DASHBOARDS_ROUTE.WORKSPACE.CUSTOMIZE._NAME,
        params: { dashboardId: dashboardDetailState.dashboardId ?? '' },
        hash: `#${MANAGE_VARIABLES_HASH_NAME}`,
    });
};
const handleClickButton = () => {
    if (visibleMenu.value) {
        hideContextMenu();
    } else {
        focusOnContextMenu();
    }
};

const handleSelectVariable = () => {
    _toggleDashboardVariableUse();
    hideContextMenu();
    state.searchText = '';
};

const handleUpdateSearchText = debounce((text: string) => {
    state.searchText = text;
    reloadMenu();
}, 200);
const handleConfirmUncheckModal = () => {
    _updateVariablesUse(state.selectedCustomVariable, false);
    state.uncheckConfirmModalVisible = false;
};
const handleCancelUncheckModal = () => {
    /* This $patch() is for initiating context menu items (state.selected) */
    dashboardDetailStore.$patch((_state) => {
        _state.variablesSchema = { ..._state.variablesSchema };
    });
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

<style lang="postcss" scoped>
.variable-more-button-dropdown {
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
