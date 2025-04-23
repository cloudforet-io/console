<script setup lang="ts">

import { computed, reactive } from 'vue';

import { PButton, PPopover, PCopyButton } from '@cloudforet/mirinae';

import type { DashboardGlobalVariable } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';

import { useWidgetContextStore } from '@/common/modules/widgets/_store/widget-context-store';

import { getOrderedGlobalVariables } from '@/services/_shared/dashboard/dashboard-detail/helpers/dashboard-global-variables-helper';

const widgetContextStore = useWidgetContextStore();
const widgetContextState = widgetContextStore.state;

const state = reactive({
    popperVisible: false,
    variableItems: computed<DashboardGlobalVariable[]>(() => {
        const _refinedProperties: DashboardGlobalVariable[] = Object.values(widgetContextState.dashboard?.vars_schema?.properties || {})
            .map((property) => ({
                key: property.key,
                name: property.name,
            }));
        return getOrderedGlobalVariables(_refinedProperties);
    }),
});

const getJinjaTemplateGlobalVariableValue = (value: string) => `{{ global.${value} }}`;
</script>

<template>
    <p-popover :is-visible.sync="state.popperVisible"
               :class="{ 'widget-form-data-table-global-variable-view-button': true, 'open': state.popperVisible }"
               trigger="click"
               class="filters-popover"
    >
        <p-button class="view-global-variable-button"
                  style-type="secondary"
                  size="sm"
        >
            {{ $t('DASHBOARDS.DETAIL.VIEW_GLOBAL_VARIABLE') }}
        </p-button>
        <template #content>
            <div class="preview-global-variable">
                <div class="name-section">
                    <div v-for="(variable) in state.variableItems"
                         :key="`${variable.key}-name-item`"
                         class="variable-name-item"
                    >
                        <div class="variable-name">
                            {{ variable.name }}
                        </div>
                    </div>
                </div>
                <div class="copy-section">
                    <div v-for="(variable) in state.variableItems"
                         :key="`${variable.key}-key-item`"
                         class="variable-key-item"
                    >
                        <p-copy-button show-text
                                       :value="getJinjaTemplateGlobalVariableValue(variable.key)"
                        >
                            {{ getJinjaTemplateGlobalVariableValue(variable.key) }}
                        </p-copy-button>
                    </div>
                </div>
            </div>
        </template>
    </p-popover>
</template>

<style scoped lang="postcss">
.widget-form-data-table-global-variable-view-button {
    .preview-global-variable {
        @apply flex;
        .name-section {
            @apply bg-gray-100;
            .variable-name-item {
                height: 1.875rem;
                padding: 0.375rem 1rem;
                .variable-name {
                    @apply text-label-md font-normal text-gray-900;
                }
            }
        }
        .copy-section {
            @apply border-t border-r border-b border-gray-100 ;
            .variable-key-item {
                @apply font-normal text-gray-900;
                display: flex;
                align-items: center;
                height: 1.875rem;
                padding: 0.375rem 1rem;
            }
        }
    }
}
</style>
