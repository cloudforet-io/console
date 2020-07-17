<template>
    <component :is="component" :options="options" :data="data" />
</template>

<script lang="ts">
import {
    computed, onMounted, reactive, toRefs,
} from '@vue/composition-api';


interface State {
    component: any;
    loader: () => Promise<any>;
}

export default {
    name: 'PDynamicField',
    props: {
        // eslint-disable-next-line @typescript-eslint/camelcase,camelcase
        type: {
            type: String,
            default: 'text',
        },
        // eslint-disable-next-line camelcase,@typescript-eslint/camelcase
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: '',
        },
    },
    setup(props) {
        // noinspection TypeScriptCheckImport
        const state = reactive<any>({
            component: null,
            loader: computed<() => Promise<any>>(() => () => import(`./templates/${props.type}/index.vue`)),
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
};
</script>
