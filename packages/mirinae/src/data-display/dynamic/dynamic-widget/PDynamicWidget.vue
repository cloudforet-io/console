<template>
    <component :is="component"
               :index="index"
               :name="name"
               :schema-options="schemaOptions"
               :data="data"
               :loading="loading"
               :view-options="viewOptions"
               :field-handler="fieldHandler"
               class="p-dynamic-widget"
    />
</template>

<script lang="ts">
import {
    defineComponent,
    reactive, toRefs, watch,
} from 'vue';
import type { PropType, AsyncComponent } from 'vue';
import type { ImportedComponent } from 'vue/types/options';

import type {
    DynamicWidgetFieldHandler,
    DynamicWidgetProps, DynamicWidgetType,
} from '@/data-display/dynamic/dynamic-widget/type';
import {
    DYNAMIC_WIDGET_TYPE,
} from '@/data-display/dynamic/dynamic-widget/type';
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';
import PPaneLayout from '@/layouts/pane-layout/PPaneLayout.vue';

const componentMap: Record<DynamicWidgetType, AsyncComponent> = {
    summary: () => ({
        component: import('./templates/summary/index.vue') as Promise<ImportedComponent>,
    }),
    chart: () => ({
        component: import('./templates/chart/index.vue') as Promise<ImportedComponent>,
    }),
};

export default defineComponent<DynamicWidgetProps>({
    name: 'PDynamicWidget',
    components: { PPaneLayout, PSkeleton },
    props: {
        index: {
            type: Number,
            default: 0,
        },
        type: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            default: '',
        },
        schemaOptions: {
            type: Object,
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
            type: Object,
            default: () => ({}),
        },
        fieldHandler: {
            type: Function as PropType<DynamicWidgetFieldHandler|undefined>,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            component: null as null|AsyncComponent,
        });

        const getComponent = async () => {
            try {
                if (!DYNAMIC_WIDGET_TYPE.includes(props.type)) {
                    throw new Error(`[Dynamic Widget] Unacceptable widget type: widget type must be one of ${DYNAMIC_WIDGET_TYPE}. ${props.type} is not acceptable.`);
                }

                state.component = componentMap[props.type];
            } catch (e) {
                console.error(e);
                state.component = null;
            }
        };

        watch(() => props.type, (aft, bef) => {
            if (aft !== bef) {
                getComponent();
            }
        }, { immediate: true });


        return {
            ...toRefs(state),
            getComponent,
        };
    },
});
</script>

<style lang="postcss">
.p-dynamic-widget {
    @apply overflow-hidden;
}
</style>
