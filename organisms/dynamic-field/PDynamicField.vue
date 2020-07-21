<template>
    <component :is="component"
               :options="options" :data="data"
               :extra="extra"
    />
</template>

<script lang="ts">
import {
    computed, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import { DynamicFieldProps } from '@/components/organisms/dynamic-field/type';


interface State {
    component: any;
    loader: () => Promise<any>;
}

export default {
    name: 'PDynamicField',
    props: {
        type: {
            type: String,
            default: 'text',
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number, null],
            default: '',
        },
        extra: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: DynamicFieldProps) {
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
