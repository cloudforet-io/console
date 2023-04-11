<template>
    <div class="p-dynamic-widget-summary">
        <span class="name">
            {{ name }}
        </span>
        <span class="value">
            <p-skeleton v-if="loading"
                        height="1.75rem"
            />
            <p-dynamic-field v-else
                             :type="valueOptions.type"
                             :data="value"
                             :options="valueOptions.options"
                             :extra-data="valueOptions"
                             :handler="fieldHandler"
            />
        </span>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
    reactive, toRefs,
} from 'vue';

import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import { DEFAULT_VALUE_OPTIONS } from '@/data-display/dynamic/dynamic-widget/config';
import type {
    DynamicWidgetFieldHandler,
    DynamicWidgetProps,
    DynamicWidgetSchemaOptions,
    DynamicWidgetViewOptions,
} from '@/data-display/dynamic/dynamic-widget/type';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';

type DynamicWidgetSummaryProps = Exclude<DynamicWidgetProps, 'type'&'index'>;

export default defineComponent<DynamicWidgetSummaryProps>({
    name: 'PDynamicWidgetSummary',
    components: { PDynamicField, PSkeleton },
    props: {
        name: {
            type: String,
            default: '',
        },
        schemaOptions: {
            type: Object as () => DynamicWidgetSchemaOptions,
            default: () => ({}),
        },
        data: {
            type: [Object, String, Number, Array],
            default: undefined,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        viewOptions: {
            type: Object as () => DynamicWidgetViewOptions,
            default: () => ({}),
        },
        fieldHandler: {
            type: Function as PropType<DynamicWidgetFieldHandler|undefined>,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            valueOptions: computed(() => props.schemaOptions?.value_options ?? DEFAULT_VALUE_OPTIONS),
            value: computed(() => {
                let value = getValueByPath(props.data, state.valueOptions.key);
                if (Array.isArray(value)) value = value[0];
                return value ?? '-';
            }),
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
.p-dynamic-widget-summary {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    min-width: inherit;
    min-height: 3rem;
    > .name {
        @apply text-gray-900;
        line-height: 1.125rem;
        font-size: 0.875rem;
        margin-bottom: 0.125rem;
    }
    > .value {
        display: inline-flex;
        font-size: 1.125rem;
        font-weight: bold;
        line-height: 1.75rem;
        .p-skeleton {
            min-width: 40px;
        }
    }
}
</style>
