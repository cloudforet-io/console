<template>
    <p-pane-layout class="p-dynamic-widget-card">
        <span class="name">
            <p-skeleton v-if="loading" width="50%" height="1rem" />
            <template v-else>{{ name }}</template>
        </span>
        <span class="value">
            <p-skeleton v-if="loading" height="1.5rem" />
            <p-dynamic-field v-else
                             :type="valueOptions.type"
                             :data="value"
                             :options="valueOptions.options"
                             :extra-data="valueOptions"
                             :handler="fieldHandler"
            />
        </span>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, PropType,
    reactive, toRefs,
} from '@vue/composition-api';
import {
    DynamicWidgetFieldHandler,
    DynamicWidgetProps,
    DynamicWidgetSchemaOptions,
    DynamicWidgetViewOptions,
} from '@/data-display/dynamic/dynamic-widget/type';
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';
import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import { DEFAULT_VALUE_OPTIONS } from '@/data-display/dynamic/dynamic-widget/config';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PPaneLayout from '@/layouts/pane-layout/PPaneLayout.vue';
import { commaFormatter } from '@/util/helpers';

type DynamicWidgetCardProps = Exclude<DynamicWidgetProps, 'type'>

export default defineComponent<DynamicWidgetCardProps>({
    name: 'PDynamicWidgetCard',
    components: { PPaneLayout, PDynamicField, PSkeleton },
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
                if (typeof value === 'number') return commaFormatter(value);
                return value ?? '';
            }),
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
.p-dynamic-widget-card {
    display: flex;
    padding: 0.625rem 1rem;
    justify-content: space-between;
    align-items: center;
    min-width: 391px;
    height: 44px;
    .name {
        @apply text-gray-700;
        line-height: 1.2;
        font-size: 1rem;
        display: inline-flex;
        align-items: center;
        flex-grow: 1;
    }
    .value {
        display: inline-flex;
        align-items: center;
        font-size: 1.125rem;
        font-weight: bold;
        line-height: 1.55;
        .p-skeleton {
            min-width: 40px;
        }
    }
}
</style>
