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
                        :menu="variables"
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
import { vOnClickOutside } from '@vueuse/components';
import {
    onMounted, reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PButton, PContextMenu, useContextMenuController } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep, forEach } from 'lodash';

import { SpaceRouter } from '@/router';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/config';

interface Props {
    variableMap: DashboardVariablesSchema['properties'];
    variableOrder: string[];
}
interface EventEmits {
    (e: string, value: string): void;
    (e: 'change', value: DashboardVariablesSchema['properties']): void;
}

const props = defineProps<Props>();
const emit = defineEmits<EventEmits>();

const state = reactive({
    targetRef: null,
    contextMenuRef: null,
    variables: [] as MenuItem[],
    selected: [] as MenuItem[],
});

const {
    targetRef,
    contextMenuRef,
    variables,
    selected,
} = toRefs(state);

const {
    visibleMenu,
    hideContextMenu,
    showContextMenu,
    fixedMenuStyle,
    reorderMenuBySelection,
    menu,
} = useContextMenuController({
    targetRef,
    contextMenuRef,
    useReorderBySelection: true,
    useFixedStyle: true,
    menu: variables,
});

// event
const handleOpenOverlay = () => {
    SpaceRouter.router.push({ hash: MANAGE_VARIABLES_HASH_NAME });
};
const handleClickButton = () => {
    if (visibleMenu.value) {
        hideContextMenu();
    } else {
        reorderMenuBySelection(selected.value);
        showContextMenu();
    }
};

// After context menu is hidden, update selected variable's use.
watch(() => visibleMenu.value, () => {
    if (visibleMenu.value) return;
    const properties = cloneDeep(props.variableMap) as DashboardVariablesSchema['properties'];
    props.variableOrder.forEach((d) => {
        properties[d].use = state.selected.some((item) => item.name === d);
    });
    emit('change', properties);
});

onMounted(() => {
    const properties = props.variableMap;
    const defaultSelected = [] as MenuItem[];
    const defaultVariables = [] as MenuItem[];
    props.variableOrder.forEach((d) => {
        defaultVariables.push({
            name: d, label: d,
        });
        if (!properties[d]?.use) return;
        defaultSelected.push({
            name: d,
            label: d,
        });
    });
    state.variables = defaultVariables;
    state.selected = defaultSelected;
});

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
