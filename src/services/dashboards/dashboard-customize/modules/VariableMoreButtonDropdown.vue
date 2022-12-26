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

import type { DashboardVariableSchemaProperty } from '@/services/dashboards/config';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/config';

interface Props {
    variableMap: {[key: string]: DashboardVariableSchemaProperty };
    variableOrder: string[];
}

interface EventEmits {
    (e: string, value: string): void;
    (e: 'manage-more'): void;
    (e: 'select', value: {[key: string]: DashboardVariableSchemaProperty }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<EventEmits>();

const state = reactive({
    visibleMenu: false,
    variables: computed(() => {
        const properties = props.variableMap;
        const result = [] as any[];
        Object.keys(properties).forEach((d) => result.push({
            name: d,
            label: properties[d].name,
        }));
        return result;
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
    const result = { ...props.variableMap } as {[key: string]: DashboardVariableSchemaProperty };
    if (props.variableMap[item.name]) {
        result[item.name].use = !result[item.name].use;
    }
    emit('select', result);
};

onMounted(() => {
    const properties = props.variableMap;
    const result = [] as MenuItem[];
    Object.keys(properties).forEach((d) => {
        if (!properties[d].use) return;
        result.push({
            name: d,
            label: properties[d].name,
        });
    });
    state.selected = result;
});

</script>

<style lang="postcss" scoped>
.variable-more-button {
    @apply inline-block relative;
}
</style>
