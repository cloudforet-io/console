<template>
    <component :is="component"
               :name="name"
               :schema-options="schemaOptions"
               :data="data"
               :loading="loading"
               :view-options="viewOptions"
               class="p-dynamic-widget"
    />
</template>

<script lang="ts">
import {
    computed, defineComponent,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { DYNAMIC_WIDGET_TYPE, DynamicWidgetProps } from '@/data-display/dynamic/dynamic-widget/type';
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';
import PPaneLayout from '@/layouts/pane-layout/PPaneLayout.vue';


export default defineComponent<DynamicWidgetProps>({
    name: 'PDynamicWidget',
    components: { PPaneLayout, PSkeleton },
    props: {
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
    },
    setup(props) {
        // noinspection TypeScriptCheckImport
        const state = reactive({
            component: null as any,
            loader: computed<() => Promise<any>>(() => () => import(/* webpackMode: "eager" */ `./templates/${props.type}/index.vue`)) as unknown as () => Promise<any>,
        });

        const getComponent = async () => {
            try {
                await state.loader();

                if (!DYNAMIC_WIDGET_TYPE.includes(props.type)) {
                    throw new Error(`[Dynamic Widget] Unacceptable widget type: widget type must be one of ${DYNAMIC_WIDGET_TYPE}. ${props.type} is not acceptable.`);
                }
                state.component = async () => state.loader();
            } catch (e) {
                console.error(e);
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
