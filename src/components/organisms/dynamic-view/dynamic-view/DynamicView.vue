<template>
    <component :is="component"
               :name="name"
               :data_source="data_source"
               :key_path="key_path"
               :data="data"
               :rootMode="rootMode"
    />
</template>

<script lang="ts">
/* eslint-disable camelcase,vue/prop-name-casing */

import {
    computed, createComponent, onMounted, reactive, toRefs,
} from '@vue/composition-api';


interface State {
    component:any,
    loader:()=>Promise<any>
}

export default createComponent({
    name: 'PDynamicView',
    props: {
        name: {
            type: String,
            default: '',
        },
        view_type: {
            type: String,
            required: true,
        },
        data_source: {
            type: Array,
            required: true,
        },
        key_path: {
            type: String,
            default: '',
        },
        data: {
            type: Object,
            required: true,
        },
        rootMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props:any) {
        const state = reactive<any>({
            component: null,
            loader: computed<()=>Promise<any>>(() => () => import(`./templates/${props.view_type}/index.vue`)),
        });
        onMounted(():void => {
            state.loader()
                .then(() => {
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
