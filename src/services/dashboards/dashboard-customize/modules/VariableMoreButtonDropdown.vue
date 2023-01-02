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
                        :selected.sync="selected"
                        multi-selectable
                        show-clear-selection
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
    reactive, toRefs, watch,
} from 'vue';

import { PButton, PContextMenu, useContextMenuController } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep } from 'lodash';

import { SpaceRouter } from '@/router';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/config';

interface Props {
    variables: DashboardVariablesSchema['properties'];
    variableOrder: string[];
}
interface EventEmits {
    (e: string, value: string): void;
    (e: 'change', value: DashboardVariablesSchema['properties']): void;
}

const props = defineProps<Props>();
const emit = defineEmits<EventEmits>();

const state = reactive({
    targetRef: null as HTMLElement | null,
    contextMenuRef: null as typeof PContextMenu | null,
    variableList: [] as MenuItem[],
    selected: [] as MenuItem[],
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

// event
const handleOpenOverlay = () => {
    hideContextMenu();
    SpaceRouter.router.push({ hash: MANAGE_VARIABLES_HASH_NAME });
};
const handleClickButton = () => {
    if (visibleMenu.value) {
        hideContextMenu();
    } else {
        showContextMenu(true); // update reorderedMenu automatically
    }
};

// After context menu is hidden, update selected variable's use.
// TODO: refactor
watch(() => visibleMenu.value, () => {
    if (visibleMenu.value) return;
    const properties = cloneDeep(props.variables) as DashboardVariablesSchema['properties'];
    props.variableOrder.forEach((d) => {
        properties[d].use = state.selected.some((item) => item.name === d);
    });
    emit('change', properties);
});
// watch([visibleMenu, reorderedMenu], ([_visibleMenu]) => {
//     if (_visibleMenu) {
//         return;
//     }
//
//     // const [, prevReorderedMenu] = prev;
//     // if (_reorderedMenu === prevReorderedMenu) {
//     //     return;
//     // }
//
//     const properties = { ...props.variables };
//     selected.value.forEach((item) => {
//         if (!item.name) return;
//         if (!properties[item.name].use) return;
//         properties[item.name] = { ...props.variables[item.name], use: true };
//     });
//     emit('change', properties);
// });

watch(() => props.variables, (variables) => {
    const properties = variables;
    const defaultSelected = [] as MenuItem[];
    const defaultVariableList = [] as MenuItem[];
    props.variableOrder.forEach((d) => {
        defaultVariableList.push({
            name: d, label: d,
        });
        if (!properties[d]?.use) return;
        defaultSelected.push({
            name: d,
            label: d,
        });
    });
    state.variableList = defaultVariableList;
    state.selected = defaultSelected;
}, { immediate: true });

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
