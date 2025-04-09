<script setup lang="ts">

import { onClickOutside } from '@vueuse/core';
import {
    computed, reactive, ref, watch,
} from 'vue';

import { PI, PContextMenu, PFieldTitle } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { TransformDataTableInfo } from '@/common/modules/widgets/types/widget-data-table-type';
import type { DataTableOperator } from '@/common/modules/widgets/types/widget-model';

import { gray } from '@/styles/colors';


interface Props {
    dataTableId: string;
    operator: DataTableOperator;
    dataTableInfo: TransformDataTableInfo;
    isLegacyDataTable?: boolean;
}
const props = defineProps<Props>();

const emit = defineEmits<{(e: 'update:data-table-info', value: TransformDataTableInfo): void;}>();

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const storeState = reactive({
    isJoinRestricted: computed<boolean|undefined>(() => widgetGenerateState.joinRestrictedMap[props.dataTableId]),
});


const state = reactive({
    isDualDropdown: computed(() => props.operator === 'JOIN' || props.operator === 'CONCAT'),
    proxyDataTableInfo: useProxyValue('dataTableInfo', props, emit),
    visibleMenu: false,
    secondaryVisibleMenu: false,
    baseMenuItems: computed(() => dataTableList.value
        .filter((dataTable) => !dataTable.data_table_id.startsWith('UNSAVED-') && dataTable.data_table_id !== props.dataTableId)
        .map((dataTable) => ({
            label: dataTable.name,
            name: dataTable.data_table_id,
            icon: dataTable.data_type === DATA_TABLE_TYPE.ADDED ? 'ic_service_data-sources' : 'ic_transform-data',
            operator: dataTable.operator,
        }))),
    dataTableMenuItems: computed<MenuItem[]>(() => {
        const alreadySelected = state.secondarySelected && state.secondarySelected.length ? [{ ...state.secondarySelected[0], disabled: true, iconColor: gray[300] }] : [];
        const pivoted = state.baseMenuItems.filter((item) => item.operator === 'PIVOT').map((item) => ({ ...item, disabled: true, iconColor: gray[300] }));
        if (alreadySelected.length || pivoted.length) {
            return [
                ...state.baseMenuItems.filter((item) => item.name !== alreadySelected[0]?.name && item.operator !== 'PIVOT'),
                ...alreadySelected,
                ...pivoted,
            ];
        }
        return state.baseMenuItems;
    }),
    selected: undefined as string|MenuItem[]|undefined,
    secondaryDataTableMenuItems: computed<MenuItem[]>(() => {
        const alreadySelected = state.selected && state.selected.length ? [{ ...state.selected[0], disabled: true, iconColor: gray[300] }] : [];
        const pivoted = state.baseMenuItems.filter((item) => item.operator === 'PIVOT').map((item) => ({ ...item, disabled: true, iconColor: gray[300] }));
        if (alreadySelected.length || pivoted.length) {
            return [
                ...state.baseMenuItems.filter((item) => item.name !== alreadySelected[0]?.name && item.operator !== 'PIVOT'),
                ...alreadySelected,
                ...pivoted,
            ];
        }
        return state.baseMenuItems;
    }),
    secondarySelected: undefined as string|MenuItem[]|undefined,
});
const containerRef = ref<HTMLElement|null>(null);
const secondContainerRef = ref<HTMLElement|null>(null);

/* Events */
const handleClickSelectButton = (isSecondary?: boolean) => {
    if (props.isLegacyDataTable) return;
    if (isSecondary) {
        state.secondaryVisibleMenu = !state.secondaryVisibleMenu;
        return;
    }
    state.visibleMenu = !state.visibleMenu;
};
const handleSelectDataTable = (item: MenuItem, isSecondary?: boolean) => {
    if (isSecondary) {
        if (item.name === state.secondarySelected?.[0]?.name) return;
        state.secondarySelected = [item];
        const dataTables = state.selected ? [state.selected[0].name, item.name] : [undefined, item.name];
        state.proxyDataTableInfo = {
            ...state.proxyDataTableInfo,
            dataTables,
        };
        widgetGenerateStore.setJoinRestrictedMap({
            ...widgetGenerateState.joinRestrictedMap,
            [props.dataTableId]: false,
        });
        state.secondaryVisibleMenu = false;
        return;
    }
    if (item.name === state.selected?.[0]?.name) return;
    state.selected = [item];
    if (state.isDualDropdown) {
        const dataTables = state.secondarySelected ? [item.name, state.secondarySelected[0].name] : [item.name];
        state.proxyDataTableInfo = {
            ...state.proxyDataTableInfo,
            dataTables,
        };
    } else {
        state.proxyDataTableInfo = {
            ...state.proxyDataTableInfo,
            dataTableId: item.name,
        };
    }
    state.visibleMenu = false;
};
/* Utils */
const hideMenu = (isSecondary?: boolean) => {
    if (isSecondary) {
        state.secondaryVisibleMenu = false;
        return;
    }
    state.visibleMenu = false;
};

onClickOutside(containerRef, () => hideMenu(false));
onClickOutside(secondContainerRef, () => hideMenu(true));

watch(() => props.dataTableInfo, (newVal) => {
    if (state.selected === undefined && state.secondarySelected === undefined) {
        if (state.isDualDropdown) {
            const _selected = state.dataTableMenuItems.find((item) => item.name === newVal.dataTables[0]);
            const _secondarySelected = state.dataTableMenuItems.find((item) => item.name === newVal.dataTables[1]);
            state.selected = _selected ? [_selected] : undefined;
            state.secondarySelected = _secondarySelected ? [_secondarySelected] : undefined;
            return;
        }

        const _selected = state.dataTableMenuItems.find((item) => item.name === newVal.dataTableId);
        state.selected = _selected ? [_selected] : undefined;
    }
}, { immediate: true });

</script>

<template>
    <div class="widget-form-data-table-card-transform-data-table-dropdown">
        <div v-if="state.isDualDropdown"
             class="data-relation"
        />
        <div :class="{'dropdown-wrapper': true, 'is-dual': state.isDualDropdown}">
            <div ref="containerRef"
                 class="dropdown-container"
            >
                <p-field-title v-if="props.operator === 'JOIN'"
                               size="sm"
                               color="gray"
                               class="join-table-text"
                >
                    {{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.LEFT_TABLE') }}
                </p-field-title>
                <div ref="targetRef"
                     :class="{'select-button': true,
                              selected: !!state.selected,
                              disabled: props.isLegacyDataTable,
                              error: state.selected && !dataTableList.some((dataTable) => dataTable.data_table_id === state.selected?.[0]?.name)
                     }"
                     @click="handleClickSelectButton(false)"
                >
                    <span class="text">
                        <p-i v-if="state.selected"
                             :name="state.selected[0]?.icon"
                             width="1rem"
                             height="1rem"
                        />
                        {{ state.selected ? state.selected[0].label : 'Select' }}
                    </span>
                    <span :class="{'arrow-button': true, opened: state.visibleMenu}">
                        <p-i :name="state.visibleMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                             width="1.5rem"
                             height="1.5rem"
                             color="inherit"
                        />
                    </span>
                </div>
                <p-context-menu v-show="state.visibleMenu"
                                ref="menuRef"
                                class="dropdown-context-menu"
                                :menu="state.dataTableMenuItems"
                                :selected="state.selected"
                                @select="handleSelectDataTable($event, false)"
                />
            </div>
            <div v-if="state.isDualDropdown"
                 ref="secondContainerRef"
                 class="dropdown-container"
            >
                <p-field-title v-if="props.operator === 'JOIN'"
                               size="sm"
                               color="gray"
                               class="join-table-text"
                >
                    {{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.RIGHT_TABLE') }}
                </p-field-title>
                <div ref="targetRef"
                     :class="{'select-button': true,
                              selected: !!state.secondarySelected,
                              error: (state.secondarySelected && !dataTableList.some((dataTable) => dataTable.data_table_id === state.secondarySelected?.[0]?.name))
                                  || storeState.isJoinRestricted,
                              [props.operator]: true
                     }"
                     @click="handleClickSelectButton(true)"
                >
                    <span class="text">
                        <p-i v-if="state.secondarySelected"
                             :name="state.secondarySelected[0]?.icon"
                             width="1rem"
                             height="1rem"
                        />
                        {{ state.secondarySelected ? state.secondarySelected[0].label : 'Select' }}
                    </span>
                    <span :class="{'arrow-button': true, opened: state.secondaryVisibleMenu}">
                        <p-i :name="state.secondaryVisibleMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                             width="1.5rem"
                             height="1.5rem"
                             color="inherit"
                        />
                    </span>
                </div>
                <p-context-menu v-show="state.secondaryVisibleMenu"
                                ref="menuRef"
                                class="dropdown-context-menu"
                                :menu="state.secondaryDataTableMenuItems"
                                :selected="state.secondarySelected"
                                @select="handleSelectDataTable($event, true)"
                />
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-transform-data-table-dropdown {
    @apply relative w-full flex items-center;
    .data-relation {
        @apply border-l border-t border-b border-gray-300 rounded-l-xl;
        width: 0.75rem;
        height: 3.5625rem;
    }
    .dropdown-wrapper {
        @apply flex flex-col gap-2 w-full;

        .dropdown-container {
            @apply relative;
            .join-table-text {
                margin-bottom: 0.125rem;
            }
            .select-button {
                @apply flex justify-between items-center bg-gray-100 border border-gray-300 rounded-xl w-full cursor-pointer;
                border-left-width: 0.375rem;
                height: 3rem;
                padding: 0.4375rem 0.4375rem 0.4375rem 0.75rem;
                box-sizing: border-box;

                .text {
                    @apply text-gray-600 text-label-md flex items-center gap-1;
                }
                .arrow-button {
                    @apply text-gray-600;

                    &.opened {
                        @apply text-secondary;
                    }
                }

                &.disabled {
                    @apply cursor-not-allowed;
                }

                &.selected {
                    @apply bg-indigo-100 border-indigo-400;
                    &.JOIN {
                        @apply bg-peacock-100 border-peacock-400;
                    }
                    .text {
                        @apply text-gray-800;
                    }
                }
                &.error {
                    @apply border-red-300 bg-red-100;
                }
            }

            /* custom design-system component - p-context-menu */
            :deep(.p-context-menu) {
                min-width: calc(100% - 1.5rem);
                width: calc(100% - 1.5rem);
            }

            .dropdown-context-menu {
                @apply absolute;
                margin-top: -0.5625rem;
                z-index: 1000;
                left: 1rem;
            }
        }
    }
}
</style>
