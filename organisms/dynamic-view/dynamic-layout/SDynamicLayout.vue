<template>
    <component
        :is="component"
        :name="name"
        :options="options"
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
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import _ from 'lodash';
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
    setup(props: DynamicLayoutProps) {
        // noinspection TypeScriptCheckImport
        const state = reactive({
            component: null as any,
            isLoading: false,
            loader: computed<() => Promise<any>>(() => () => import(`./templates/${props.type}/index.vue`)),
        });

        const getComponent = () => {
            // @ts-ignore
            state.loader().then(() => {
                // @ts-ignore
                state.component = () => state.loader();
            })
                .catch(() => {
                    // eslint-disable-next-line import/no-unresolved
                    state.component = () => import('./templates/item/index.vue');
                }).finally(() => {
                    state.isLoading = false;
                });
        };


        onMounted((): void => {
            // @ts-ignore
            getComponent();
            watch(() => [props.type, props.name], (aft, bef) => {
                if (!_.isEqual(aft, bef)) {
                    state.isLoading = true;
                    getComponent();
                }
            });
        });
        return {
            ...toRefs(state),
        };
    },
});
</script>
