<template>
    <div v-on-click-outside="hideContextMenu"
         class="variable-more-button-dropdown"
         :class="{'open-menu': visibleMenu}"
    >
        <p-button ref="targetRef"
                  icon-left="ic_plus"
                  style-type="highlight"
                  @click="handleClickButton"
        >
            {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.MORE') }}
        </p-button>
        <p-context-menu v-show="visibleMenu"
                        ref="contextMenuRef"
                        class="variables-menu"
                        searchable
                        use-fixed-menu-style
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
                          icon-left="ic_setting"
                          @click="handleOpenOverlay"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.TITLE') }}
                </p-button>
            </template>
        </p-context-menu>
    </div>
</template>

<script lang="ts" setup>
// CAUTION: this vOnClickOutside is using !! Please do not remove.
import { vOnClickOutside } from '@vueuse/components';
import {
    computed,
    reactive, toRef, toRefs, watch,
} from 'vue';

import { PButton, PContextMenu, useContextMenuController } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep, debounce } from 'lodash';

import { SpaceRouter } from '@/router';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const state = reactive({
    targetRef: null as HTMLElement | null,
    contextMenuRef: null as any | null,
    searchText: '',
    variableSchema: computed<DashboardVariablesSchema>(() => dashboardDetailState.variablesSchema),
    variableList: computed<MenuItem[]>(() => state.variableSchema.order.map((property) => {
        const currentProperty = state.variableSchema.properties[property];
        return ({
            name: property, label: currentProperty.name,
        });
    })),
    selected: computed<MenuItem[]>(() => {
        const result = [] as MenuItem[];
        state.variableSchema.order.forEach((property) => {
            const currentProperty = state.variableSchema.properties[property];
            if (!currentProperty.use) return;
            result.push({ name: property, label: currentProperty.name });
        });
        return result;
    }),
    // Since variable's use changes after the dropdown is closed, create state to store the previous state and use it.
    selectedForUpdate: [] as MenuItem[],
});

const {
    visibleMenu,
    refinedMenu,
    contextMenuStyle,
    showContextMenu,
    hideContextMenu,
    focusOnContextMenu,
    initiateMenu,
    reloadMenu,
    showMoreMenu,
} = useContextMenuController({
    useFixedStyle: true,
    targetRef: toRef(state, 'targetRef'),
    contextMenuRef: toRef(state, 'contextMenuRef'),
    useMenuFiltering: true,
    useReorderBySelection: true,
    searchText: toRef(state, 'searchText'),
    selected: toRef(state, 'selected'),
    menu: toRef(state, 'variableList'),
    pageSize: 10,
});

// helper
const updateVariablesUse = () => {
    const _varialbesSchema = cloneDeep(state.variableSchema);
    state.variableSchema.order.forEach((property) => {
        _varialbesSchema.properties[property].use = state.selectedForUpdate.some((menu) => menu.name === property);
    });
    dashboardDetailState.variablesSchema = _varialbesSchema;
};

// event
const handleOpenOverlay = () => {
    hideContextMenu();
    updateVariablesUse();
    SpaceRouter.router.push({ hash: MANAGE_VARIABLES_HASH_NAME });
};
const handleClickButton = () => {
    if (visibleMenu.value) {
        hideContextMenu();
    } else {
        state.selectedForUpdate = state.selected;
        showContextMenu(); // update reorderedMenu automatically
    }
};

const handleSelectVariable = (changedSelected: MenuItem[]) => {
    state.selectedForUpdate = changedSelected;
};

const handleUpdateSearchText = debounce((text: string) => {
    state.searchText = text;
    reloadMenu();
}, 200);

watch(visibleMenu, (_visibleMenu) => {
    if (_visibleMenu) {
        initiateMenu();
    } else {
        updateVariablesUse();
        state.searchText = '';
    }
    // Reflect selectedForUpdate changes after the dropdown is closed.
}, { immediate: true });

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
}
</style>
