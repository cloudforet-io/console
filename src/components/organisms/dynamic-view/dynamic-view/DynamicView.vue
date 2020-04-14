<template>
    <component :is="component"
               :data_source="data_source"
               :data="data"
               :key_path="key_path"
               :api-handler="apiHandler"
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
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';


interface State {
    component: any;
    loader: Computed<() => Promise<any>>;
}

export default defineComponent({
    name: 'PDynamicView',
    props: {
        view_type: {
            type: String,
            required: true,
        },
        data_source: {
            type: Array,
            required: true,
        },
        data: {
            type: [Object, Array],
            default: () => ({}),
        },
        key_path: {
            type: String,
            default: '',
        },
        apiHandler: {
            type: Object,
            default: null,
        },
        vbind: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: any) {
        // noinspection TypeScriptCheckImport
        const state = reactive<State>({
            component: null,
            loader: computed<() => Promise<any>>(() => () => import(`./templates/${props.view_type}/index.vue`)),
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
