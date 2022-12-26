<template>
    <div class="variable-more-button">
        <p-button icon-left="ic_plus"
                  style-type="highlight"
                  @click="handleClickButton"
        >
            {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.MORE') }}
        </p-button>
        <p-context-menu v-if="state.visibleMenu"
                        :menu="state.variables"
                        :selected="state.selected"
                        multi-selectable
                        searchable
                        use-fixed-menu-style
                        show-clear-selection
                        @select="handleVariableSelect"
        >
            <template #bottom>
                <p-button style-type="secondary"
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
import {
    computed, onMounted, reactive,
} from 'vue';

import { PButton, PContextMenu } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { SpaceRouter } from '@/router';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/config';

interface Props {
    variableMap: DashboardVariablesSchema['properties'];
    variableOrder: string[];
}

interface EventEmits {
    (e: string, value: string): void;
    (e: 'manage-more'): void;
    (e: 'select', value: DashboardVariablesSchema['properties']): void;
}

const props = defineProps<Props>();
const emit = defineEmits<EventEmits>();

const state = reactive({
    visibleMenu: false,
    variables: computed(() => {
        const properties = props.variableMap;
        const menuItems = [] as any[];
        Object.keys(properties).forEach((d) => menuItems.push({
            name: d,
            label: properties[d].name,
        }));
        return menuItems;
    }),
    order: computed(() => props.variableOrder),
    selected: [] as MenuItem[],
});

// event
const handleOpenOverlay = () => {
    SpaceRouter.router.push({ hash: MANAGE_VARIABLES_HASH_NAME });
};
const handleClickButton = () => {
    state.visibleMenu = !state.visibleMenu;
};
const handleVariableSelect = (item: MenuItem) => {
    if (!item.name) return;
    const result = { ...props.variableMap } as DashboardVariablesSchema['properties'];
    if (props.variableMap[item.name]) {
        result[item.name].use = !result[item.name].use;
    }
    emit('select', result);
};

onMounted(() => {
    const properties = props.variableMap;
    const defaultSelected = [] as MenuItem[];
    Object.keys(properties).forEach((d) => {
        if (!properties[d].use) return;
        defaultSelected.push({
            name: d,
            label: properties[d].name,
        });
    });
    state.selected = defaultSelected;
});

</script>

<style lang="postcss" scoped>
.variable-more-button {
    @apply inline-block relative;
}
</style>
