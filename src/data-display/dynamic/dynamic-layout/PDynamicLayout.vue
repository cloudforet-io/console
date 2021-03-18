<template>
    <component :is="component"
               :name="name"
               :options="options"
               :data="data"
               :fetch-options="fetchOptions"
               :type-options="typeOptions"
               :before-create="beforeCreate"
               :field-handler="fieldHandler"
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
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';
import { isEqual } from 'lodash';
import { DynamicLayoutProps } from '@/data-display/dynamic/dynamic-layout/type';
import { dynamicLayoutTypes } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';


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
            default: 'item',
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [Object, Array, String],
            default: undefined,
        },
        fetchOptions: {
            type: Object,
            default: undefined,
        },
        typeOptions: {
            type: Object,
            default: undefined,
        },
        beforeCreate: {
            type: Function,
            default: undefined,
        },
        fieldHandler: {
            type: Function,
            default: undefined,
        },
    },
    setup(props: DynamicLayoutProps, { emit }) {
        // noinspection TypeScriptCheckImport
        const state = reactive({
            component: null as any,
            loader: computed<() => Promise<any>>(() => () => import(/* webpackMode: "eager" */ `./templates/${props.type}/index.vue`)) as unknown as () => Promise<any>,
        });

        const getComponent = async () => {
            try {
                await state.loader();
                if (props.beforeCreate) await props.beforeCreate(props);

                if (!dynamicLayoutTypes.includes(props.type)) throw new Error(`[DynamicLayout] Unacceptable Type: layout type must be one of ${dynamicLayoutTypes}. ${props.type} is not acceptable.`);
                state.component = async () => state.loader();
            } catch (e) {
                state.component = () => import('./templates/item/index.vue');
            }
        };

        watch([() => props.type, () => props.name], (aft, bef) => {
            if (!isEqual(aft, bef)) {
                getComponent();
            }
        }, { immediate: false });

        onMounted(async () => {
            await getComponent();
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
