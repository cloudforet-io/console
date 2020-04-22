<template>
    <component :is="component"
               :name="name"
               :options="options"
               :data="data"
               :api="api"
               :is-show="isShow"
               v-bind="vbind"
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
    computed, defineComponent, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import { Computed } from '@/lib/type';
import { DynamicLayoutProps } from './toolset';


interface State {
    component: any;
    loader: Computed<() => Promise<any>>;
}

export default defineComponent({
    name: 'SDynamicLayout',
    props: {
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
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
    setup(props: DynamicLayoutProps) {
        // noinspection TypeScriptCheckImport
        const state = reactive<State>({
            component: null,
            loader: computed<() => Promise<any>>(() => () => import(`./templates/${props.type}/index.vue`)),
        });
        onMounted((): void => {
            // @ts-ignore
            state.loader().then(() => {
                // @ts-ignore
                state.component = () => state.loader();
            })
                .catch(() => {
                    // eslint-disable-next-line import/no-unresolved
                    state.component = () => import('./templates/item/index.vue');
                });
        });
        return {
            ...toRefs(state),
        };
    },
});
</script>
