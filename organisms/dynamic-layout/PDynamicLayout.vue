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
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import { isEqual } from 'lodash';
import { DynamicLayoutProps } from '@/components/organisms/dynamic-layout/PDynamicLayout.toolset';


export default {
    name: 'PDynamicLayout',
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
    },
    setup(props: DynamicLayoutProps) {
        // noinspection TypeScriptCheckImport
        const state = reactive({
            component: null as any,
            isLoading: true,
            loader: computed<() => Promise<any>>(() => () => import(`./templates/${props.type}/index.vue`)),
        });

        const getComponent = async () => {
            state.isLoading = true;
            try {
                // @ts-ignore
                state.component = await (() => state.loader());
            } catch (e) {
                state.component = () => import('./templates/item/index.vue');
            } finally {
                state.isLoading = false;
            }
        };

        watch(() => [props.type, props.name], (aft, bef) => {
            if (!isEqual(aft, bef)) {
                getComponent();
            }
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
