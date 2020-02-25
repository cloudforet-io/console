<template>
    <component :is="component" :view_option="view_option" :data="data" />
</template>

<script lang="ts">
import {
    computed, createComponent, onMounted, reactive, toRefs,
} from '@vue/composition-api';


interface State {
    component:any,
    loader:()=>Promise<any>
}

export default createComponent({
    name: 'PDynamicField',
    props: {
        // eslint-disable-next-line camelcase
        view_type: {
            type: String,
            required: true,
        },
        // eslint-disable-next-line camelcase,vue/prop-name-casing
        view_option: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number, null],
            default: '',
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
                    state.component = () => import('./templates/text/index.vue');
                });
        });
        return {
            ...toRefs(state),
        };
    },
});
</script>
