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
                        :style="fixedMenuStyle"
                        :menu="reorderedMenu"
                        :selected="selected"
                        multi-selectable
                        show-clear-selection
                        @update:selected="handleSelectVariable"
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
    reactive, toRefs,
} from 'vue';

import { PButton, PContextMenu, useContextMenuController } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep } from 'lodash';

import { SpaceRouter } from '@/router';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const state = reactive({
    targetRef: null as HTMLElement | null,
    contextMenuRef: null as typeof PContextMenu | null,
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
    targetRef,
    contextMenuRef,
    variableList,
    selected,
} = toRefs(state);

const {
    visibleMenu,
    hideContextMenu,
    showContextMenu,
    fixedMenuStyle,
    reorderedMenu,
} = useContextMenuController({
    targetRef,
    contextMenuRef,
    useReorderBySelection: true,
    useFixedStyle: true,
    originMenu: variableList,
    selected,
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
        // Reflect selectedForUpdate changes after the dropdown is closed.
        updateVariablesUse();
    } else {
        state.selectedForUpdate = state.selected;
        showContextMenu(true); // update reorderedMenu automatically
    }
};
const handleSelectVariable = (changedSelected: MenuItem[]) => {
    state.selectedForUpdate = changedSelected;
};

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
