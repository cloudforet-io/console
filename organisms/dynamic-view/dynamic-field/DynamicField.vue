<template>
    <component :is="component" :view_option="view_option" :data="data" />
</template>

<script lang="ts">
import {
    computed, defineComponent, onMounted, reactive, toRefs,
} from '@vue/composition-api';


interface State {
    component: any;
    loader: () => Promise<any>;
}

export default defineComponent({
    name: 'PDynamicField',
    props: {
        // eslint-disable-next-line @typescript-eslint/camelcase,camelcase
        view_type: {
            type: String,
            default:'text',
        },
        // eslint-disable-next-line camelcase,@typescript-eslint/camelcase
        view_option: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: '',
        },
    },
    setup(props: any) {
        const state = reactive<any>({
            component: null,
            loader: computed<() => Promise<any>>(() => () => import(`./templates/${props.view_type}/index.vue`)),
        });
        onMounted((): void => {
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
