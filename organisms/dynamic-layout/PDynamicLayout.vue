<template>
    <component
        :is="component"
        :name="name"
        :options="options"
        :data="data"
        :api="api"
        :is-show="isShow"
        :extra="extra"
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
    computed, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import { isEqual } from 'lodash';
import { DynamicLayoutProps } from '@/components/organisms/dynamic-layout/PDynamicLayout.toolset';
import { makeProxy } from '@/components/util/composition-helpers';


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
        api: {
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
        extra: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: DynamicLayoutProps, { emit }) {
        // noinspection TypeScriptCheckImport
        const state = reactive({
            component: null as any,
            isLoading: true,
            loader: computed<() => Promise<any>>(() => () => import(`./templates/${props.type}/index.vue`)) as unknown as () => Promise<any>,
        });

        const getComponent = async () => {
            try {
                await state.loader();
                state.component = async () => state.loader();
            } catch (e) {
                state.component = () => import('./templates/item/index.vue');
            } finally {
                state.isLoading = false;
            }
        };

        watch(() => [props.type, props.name], (aft, bef) => {
            if (!isEqual(aft, bef)) {
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
};
</script>
