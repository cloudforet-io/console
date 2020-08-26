<template>
    <component
        :is="component"
        :name="name"
        :options="options"
        :data="data"
        :fetch-options="fetchOptions"
        :typeOptions="typeOptions"
        :before-create="beforeCreate"
        :before-create-field="beforeCreateField"
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
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import { isEqual } from 'lodash';
import { DynamicLayoutProps } from '@/components/organisms/dynamic-layout/type';


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
            type: [Object, Array],
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
        beforeCreateField: {
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
            loader: computed<() => Promise<any>>(() => () => import(`./templates/${props.type}/index.vue`)) as unknown as () => Promise<any>,
        });

        const getComponent = async () => {
            try {
                await state.loader();
                if (props.beforeCreate) await props.beforeCreate(props);
                state.component = async () => state.loader();
            } catch (e) {
                state.component = () => import('./templates/item/index.vue');
            } finally {
            }
        };

        watch(() => [props.type, props.name], (aft, bef) => {
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
