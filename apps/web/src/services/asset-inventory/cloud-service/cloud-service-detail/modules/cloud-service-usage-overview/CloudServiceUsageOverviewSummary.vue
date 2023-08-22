<script lang="ts" setup>

import { PDataLoader, PDynamicWidget, PSkeleton } from '@spaceone/design-system';
import type {
    DynamicWidgetFieldHandler,
    DynamicWidgetSchema,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-widget/type';
import {
    reactive,
} from 'vue';
import { useStore } from 'vuex';

import { getUUID } from '@/lib/component-util/getUUID';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import type { Reference } from '@/lib/reference/type';

import { gray } from '@/styles/colors';

interface Props {
    schemaLoading: boolean;
    dataLoading: boolean;
    dataList: any[];
    widgetSchemaList: DynamicWidgetSchema[];
    cloudServiceTypeId: string;
}

withDefaults(defineProps<Props>(), {
    schemaLoading: false,
    dataLoading: false,
    dataList: () => [],
    widgetSchemaList: () => [],
    cloudServiceTypeId: '',
});

const store = useStore();

const state = reactive({
    contextId: getUUID(),
});

const fieldHandler: DynamicWidgetFieldHandler<Record<'reference', Reference>> = (field) => {
    if (field.extraData?.reference) {
        return referenceFieldFormatter(field.extraData.reference, field.data);
    }
    return {};
};

// LOAD REFERENCE STORE
(async () => {
    await store.dispatch('reference/loadAll');
})();

const skeletons = [1, 2, 3];
const loaderBackdropColor = gray[100];

</script>

<template>
    <p-data-loader class="cloud-service-usage-overview-summary"
                   :loading="schemaLoading"
                   :data="widgetSchemaList"
                   :min-loading-time="1000"
                   :loader-backdrop-opacity="1"
                   :loader-backdrop-color="loaderBackdropColor"
    >
        <template #loader>
            <div v-for="(_, idx) in skeletons"
                 :key="idx"
                 class="skeleton-wrapper"
            >
                <p-skeleton width="66%"
                            height="1rem"
                            class="mb-1"
                />
                <p-skeleton width="40px"
                            height="1.5rem"
                />
            </div>
        </template>
        <div v-for="(schema, idx) in widgetSchemaList"
             :key="`${state.contextId}-${idx}`"
             class="summary-wrapper"
        >
            <p-dynamic-widget type="summary"
                              :name="schema.name"
                              :data="dataList[idx]"
                              :loading="dataLoading"
                              :schema-options="schema.options"
                              :field-handler="fieldHandler"
            />
        </div>
    </p-data-loader>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-data-loader */
.cloud-service-usage-overview-summary {
    @apply bg-gray-100 rounded-lg;
    min-height: 4.1875rem;
    :deep(.data-loader-container) {
        .loader-wrapper .loader,
        .data-wrapper {
            display: flex;
            justify-content: space-between;
            min-width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
        }
    }
    .skeleton-wrapper,
    .summary-wrapper {
        position: relative;
        display: flex;
        align-items: flex-start;
        padding: 0.75rem;
        width: 100%;
        &:not(:last-of-type)::after {
            @apply border-r border-gray-200;
            content: '';
            height: calc(100% - 2rem);
            position: absolute;
            top: 1rem;
            right: 0;
        }
    }
    .skeleton-wrapper {
        flex-direction: column;
    }

    /* custom design-system component - p-dynamic-widget */
    :deep(.p-dynamic-widget) {
        width: 100%;
        min-width: 140px;
        box-sizing: content-box;
        .name {
            @apply text-gray-700 mr-2;
            font-size: 0.875rem;
            line-height: 1.2;
        }
        .value {
            @apply flex-shrink-0;
            font-size: 1.125rem;
        }
    }
}
</style>
