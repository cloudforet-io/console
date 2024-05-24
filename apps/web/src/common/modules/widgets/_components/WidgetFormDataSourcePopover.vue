<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PI, PPopover, PButton, PFieldTitle, PContextMenu,
} from '@spaceone/design-system';
import { POPOVER_TRIGGER } from '@spaceone/design-system/src/data-display/popover/type';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';


const DATA_SOURCE_DOMAIN = {
    COST: 'COST',
    ASSET: 'ASSET',
    SECURITY: 'SECURITY',
};
type DataSourceDomain = typeof DATA_SOURCE_DOMAIN[keyof typeof DATA_SOURCE_DOMAIN];
const COST_SOURCE_FROM = {
    COST_ANALYSIS: 'COST_ANALYSIS',
    BUDGET: 'BUDGET',
    COST_REPORT: 'COST_REPORT',
};
const state = reactive({
    showPopover: false,
    dataSourceDomainItems: computed(() => ([
        {
            name: DATA_SOURCE_DOMAIN.COST,
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COST'),
            icon: '_ic-ds-cost',
        },
        {
            name: DATA_SOURCE_DOMAIN.ASSET,
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.ASSET'),
            icon: '_ic-ds-asset',
        },
        {
            name: DATA_SOURCE_DOMAIN.SECURITY,
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.SECURITY'),
            icon: '_ic-ds-security',
        },
    ])),
    selectedDataSourceDomain: undefined as undefined|DataSourceDomain,
    // cost
    costDataSourceFromMenuItems: computed<MenuItem[]>(() => [
        {
            type: 'item',
            name: COST_SOURCE_FROM.COST_ANALYSIS,
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COST_ANALYSIS'),
            icon: 'ic_service_cost-analysis',
        },
        {
            type: 'item',
            name: COST_SOURCE_FROM.BUDGET,
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.BUDGET'),
            icon: 'ic_service_budget',
        },
        {
            type: 'item',
            name: COST_SOURCE_FROM.COST_REPORT,
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COST_REPORT'),
            icon: 'ic_service_cost-report',
        },
    ]),
    selectedDataSource: undefined,
});

/* Event */
const handleClickAddDataSourceButton = () => {
    state.showPopover = !state.showPopover;
};
const handleClickDataSourceDomain = (domainName: DataSourceDomain) => {
    state.selectedDataSourceDomain = domainName;
};
const handleConfirmDataSource = () => {
    // TODO: add event
    state.showPopover = false;
};
</script>

<template>
    <p-popover class="data-source-popover"
               :is-visible="state.showPopover"
               position="right-start"
               ignore-outside-click
               ignore-target-click
               :trigger="POPOVER_TRIGGER.NONE"
    >
        <div class="add-data-source-button"
             @click="handleClickAddDataSourceButton"
        >
            <p-i name="ic_plus"
                 class="link-mark"
                 height="1rem"
                 width="1rem"
                 color="inherit"
            />
        </div>
        <template #content>
            <div v-if="!state.selectedDataSourceDomain"
                 class="data-source-domain-popover-content"
            >
                <div v-for="domainItem in state.dataSourceDomainItems"
                     :key="`domain-${domainItem.name}`"
                     class="data-source-item"
                     @click="handleClickDataSourceDomain(domainItem.name)"
                >
                    <div class="icon-wrapper">
                        <p-i :name="domainItem.icon"
                             height="1.5rem"
                             width="1.5rem"
                             color="inherit"
                        />
                    </div>
                    <p>{{ domainItem.label }}</p>
                </div>
            </div>
            <div v-else
                 class="data-source-popover-content"
                 :class="[`domain-${state.selectedDataSourceDomain?.toLowerCase()}`]"
            >
                <!-- Cost -->
                <div class="top-part">
                    <div class="data-source-select-col">
                        <p-field-title :label="i18n.t('Source From')"
                                       required
                        />
                        <p-context-menu ref="contextMenuRef"
                                        :menu="state.costDataSourceFromMenuItems"
                        />
                    </div>
                    <div class="data-source-select-col">
                        <p-field-title :label="i18n.t('Source')"
                                       required
                        />
                        <p-context-menu ref="contextMenuRef"
                                        :menu="[]"
                                        searchable
                        />
                    </div>
                    <div class="data-source-select-col">
                        <p-field-title :label="i18n.t('Data Type')"
                                       required
                        />
                        <p-context-menu ref="contextMenuRef"
                                        :menu="[]"
                        />
                    </div>
                </div>
                <div class="popover-footer">
                    <p-button style-type="substitutive"
                              :disabled="!state.selectedDataSource"
                              @click="handleConfirmDataSource"
                    >
                        {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.DONE') }}
                    </p-button>
                </div>
            </div>
        </template>
    </p-popover>
</template>

<style lang="scss" scoped>
.data-source-popover {
    display: inline-block;
    position: relative;
    .add-data-source-button {
        @apply bg-primary2 rounded-full text-white border border-primary-1;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    .data-source-domain-popover-content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 11.25rem;
        .data-source-item {
            @apply border border-gray-200 rounded-md;
            display: flex;
            gap: 0.25rem;
            align-items: center;
            font-weight: 700;
            cursor: pointer;
            padding: 0.5rem 1.25rem;
            .icon-wrapper {
                @apply bg-violet-150 rounded;
            }
        }
    }
    .data-source-popover-content {
        display: flex;
        flex-direction: column;
        height: 30rem;
        &.domain-cost {
            width: 57rem;
            .top-part {
                @apply grid grid-cols-12;
                .data-source-select-col {
                    @apply col-span-4 border-r border-gray-200;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    &:last-child {
                        @apply border-r-0;
                    }
                }
            }
        }
        .top-part {
            flex: 1;
        }
        .popover-footer {
            @apply border-t border-gray-200;
            text-align: right;
            padding: 0.75rem;
        }
    }
}


/* custom design-system component - p-context-menu */
:deep(.p-context-menu) {
    border: none;
}

/* custom design-system component - p-popover */
:deep(.p-popover) {
    .popper {
        padding: 0;
    }
}
</style>
