<template>
    <component
        :is="component"
        :name="name"
        :options="mergedOptions"
        :data="data"
        :api="api"
        :toolset="toolset"
        :is-show="isShow"
        v-bind="vbind"
        :is-loading="isLoading"
        v-on="$listeners"
    >
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope" />
        </template>
    </component>
</template>

<script lang="ts">
/* eslint-disable camelcase,vue/prop-name-casing,@typescript-eslint/camelcase */

import {
    computed, defineComponent, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { Computed } from '@/lib/type';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import _ from 'lodash';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { makeProxy } from '@/lib/compostion-util';
import referenceRouter from '@/lib/reference/referenceRouter';
import { DynamicLayoutProps } from './toolset';


interface State {
    component: any;
    loader: Computed<() => Promise<any>>;
}

export default defineComponent({
    name: 'SDynamicLayout',
    components: { PSkeleton },
    props: {
        name: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            default: '',
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [Object, Array],
            default: null,
        },
        api: {
            type: Object,
            default: null,
        },
        toolset: {
            type: Object,
            default: null,
        },
        isShow: {
            type: Boolean,
            default: true,
        },
        vbind: {
            type: Object,
            default: () => ({
                initData: {},
            }),
        },
    },
    setup(props: DynamicLayoutProps, { emit }) {
        // noinspection TypeScriptCheckImport
        const state = reactive({
            component: null as any,
            isLoading: true,
            loader: computed<() => Promise<any>>(() => () => import(`./templates/${props.type}/index.vue`)) as unknown as () => Promise<any>,
            fields: computed(() => props.options.fields || []),
            mergedOptions: computed(() => ({ ...props.options, fields: state.fields })),
        });

        const getComponent = async () => {
            try {
                // reference to link fields pre-process

                // for (const field of state.fields) {
                //     if (field.reference) {
                //         // eslint-disable-next-line no-await-in-loop
                //         field.options.link = await referenceRouter(
                //             field.reference.reference_type,
                //             field.reference.reference_key,
                //         );
                //     }
                // }

                await state.loader();
                state.component = async () => state.loader();
            } catch (e) {
                state.component = () => import('./templates/item/index.vue');
            } finally {
                state.isLoading = false;
            }
        };

        watch(() => [props.type, props.name], (aft, bef) => {
            if (!_.isEqual(aft, bef)) {
                state.isLoading = true;
                getComponent();
            }
        }, { lazy: true });

        onMounted(async () => {
            await getComponent();
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>
