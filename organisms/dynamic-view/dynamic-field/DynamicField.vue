<template>
    <component :is="component" :view-option="viewOption" :data="data" />
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
        viewType: {
            type: String,
        },
        viewOption: {
            type: Object,
            default: () => {},
        },
        data: {
            type: [String, Object, Boolean, Array],
        },
    },
    setup(props:any) {
        const state = reactive<any>({
            component: null,
            loader: computed<()=>Promise<any>>(() => () => import(`./templates/${props.viewType}/index.vue`)),
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
