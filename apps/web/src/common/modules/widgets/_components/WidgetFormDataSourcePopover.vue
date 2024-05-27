<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PI, PPopover,
} from '@spaceone/design-system';
import { POPOVER_TRIGGER } from '@spaceone/design-system/src/data-display/popover/type';

import { i18n } from '@/translations';

import WidgetFormCostDataSourcePopper from '@/common/modules/widgets/_components/WidgetFormCostDataSourcePopper.vue';


const DATA_SOURCE_DOMAIN = {
    COST: 'COST',
    ASSET: 'ASSET',
    SECURITY: 'SECURITY',
};
type DataSourceDomain = typeof DATA_SOURCE_DOMAIN[keyof typeof DATA_SOURCE_DOMAIN];

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
});

/* Event */
const handleClickAddDataSourceButton = () => {
    state.showPopover = !state.showPopover;
};
const handleClickDataSourceDomain = (domainName: DataSourceDomain) => {
    state.selectedDataSourceDomain = domainName;
};
const handleSelectCostDataSource = (costDataSourceId: string, costDataType: string) => {
    // TODO: add event handler
    console.log('select-cost-data-source', costDataSourceId, costDataType);
    state.showPopover = false;
};

watch(() => state.showPopover, (val) => {
    if (!val) {
        state.selectedDataSourceDomain = undefined;
    }
});
</script>

<template>
    <p-popover class="data-source-popover"
               :is-visible="state.showPopover"
               position="right-start"
               ignore-outside-click
               ignore-target-click
               hide-close-button
               hide-padding
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
            <widget-form-cost-data-source-popper v-else
                                                 @select-cost-data-source="handleSelectCostDataSource"
            />
        </template>
    </p-popover>
</template>

<style lang="scss" scoped>
.data-source-popover {
    display: inline-block;
    position: relative;
    :deep(&.p-popover) {
        .popper {
            padding: 0;
        }
    }
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
        padding: 1rem;
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
