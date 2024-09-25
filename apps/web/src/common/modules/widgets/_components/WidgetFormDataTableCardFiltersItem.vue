<script setup lang="ts">

import { onClickOutside } from '@vueuse/core/index';
import { computed, reactive, ref } from 'vue';

import {
    PSelectDropdown, PContextMenu, PIconButton,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';
import type { AutocompleteHandler } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import { DATA_TABLE_QUERY_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import type { DataTableQueryFilterForDropdown } from '@/common/modules/widgets/types/widget-data-table-type';

interface Props {
    filterItem: MenuItem;
    handler: AutocompleteHandler;
    selectedFilter?: DataTableQueryFilterForDropdown;
    loading?: boolean;
    initSelectedWithHandler?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{(e: 'delete'): void;
    (e: 'update:selected-filter', filter: DataTableQueryFilterForDropdown): void;
}>();
const operatorButtonRef = ref<HTMLElement | null>(null);

const state = reactive({
    visibleMenu: false,
    operatorMenu: computed<MenuItem[]>(() => [
        {
            name: DATA_TABLE_QUERY_OPERATOR.contain_in.key,
            label: DATA_TABLE_QUERY_OPERATOR.contain_in.label,
        },
        {
            name: DATA_TABLE_QUERY_OPERATOR.not_contain_in.key,
            label: DATA_TABLE_QUERY_OPERATOR.not_contain_in.label,
        },
        {
            name: DATA_TABLE_QUERY_OPERATOR.in.key,
            label: DATA_TABLE_QUERY_OPERATOR.in.label,
        },
        {
            name: DATA_TABLE_QUERY_OPERATOR.not_in.key,
            label: DATA_TABLE_QUERY_OPERATOR.not_in.label,
        },
    ]),
    proxySelectedFilter: useProxyValue<DataTableQueryFilterForDropdown>('selectedFilter', props, emit),
});

const handleClickDropdown = () => {
    state.visibleMenu = !state.visibleMenu;
};
const handleSelectOperator = (operator: MenuItem) => {
    if (!operator?.name) return;
    state.proxySelectedFilter = {
        ...state.proxySelectedFilter,
        o: operator.name,
    };
};

const handleDeleteFilter = () => {
    emit('delete');
};

const handleUpdateFilterDropdown = (selected: MenuItem[]) => {
    state.proxySelectedFilter = {
        ...state.proxySelectedFilter,
        v: selected,
    };
};

onClickOutside(operatorButtonRef, () => {
    state.visibleMenu = false;
});

</script>

<template>
    <div class="widget-form-data-table-card-filters-item">
        <div class="filter-header">
            <div class="content">
                <span class="filter-name">{{ props.filterItem.label }}</span>
                <div ref="operatorButtonRef"
                     class="operator-dropdown"
                >
                    <div class="operator-button"
                         @click="handleClickDropdown"
                    >
                        {{ DATA_TABLE_QUERY_OPERATOR[state.proxySelectedFilter.o]?.label }}
                    </div>
                    <p-context-menu v-if="state.visibleMenu"
                                    class="operator-menu"
                                    :visible.sync="state.visibleMenu"
                                    :menu="state.operatorMenu"
                                    :selected="[props.selectedFilter?.o]"
                                    @select="handleSelectOperator"
                    />
                </div>
            </div>
            <p-icon-button name="ic_delete"
                           style-type="transparent"
                           size="sm"
                           @click="handleDeleteFilter"
            />
        </div>
        <p-select-dropdown class="filters-dropdown"
                           is-filterable
                           :handler="props.handler"
                           :selected="props.selectedFilter?.v"
                           :loading="props.loading"
                           multi-selectable
                           appearance-type="stack"
                           show-select-marker
                           :init-selected-with-handler="props.initSelectedWithHandler"
                           :show-delete-all-button="false"
                           :page-size="10"
                           @update:selected="handleUpdateFilterDropdown($event)"
        />
    </div>
</template>

<style scoped lang="postcss">
.widget-form-data-table-card-filters-item {
    @apply bg-white border border-gray-150 rounded-lg;
    width: 100%;
    padding: 0 0.5rem 0.5rem;
    .filter-header {
        @apply flex items-center justify-between;
        height: 2rem;

        .content {
            @apply flex items-center gap-2;
            .filter-name {
                @apply text-label-md font-bold text-gray-800;
            }
            .operator-dropdown {
                @apply relative;
                .operator-button {
                    @apply flex;
                }
                .operator-menu {
                    @apply absolute;
                    top: 100%;
                    left: 0;
                    z-index: 10;
                    width: max-content;
                }
            }
        }
    }
}
</style>
