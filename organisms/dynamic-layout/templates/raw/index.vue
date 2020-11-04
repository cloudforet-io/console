<template>
    <div class="p-dynamic-layout-raw">
        <p-panel-top v-if="name">
            {{ name }}
        </p-panel-top>
        <p-raw-data :item="rootData" :loading="loading" />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { get } from 'lodash';
import PRawData from '@/components/organisms/raw-data/PRawData.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import { RawDynamicLayoutProps, RawFetchOptions } from '@/components/organisms/dynamic-layout/templates/raw/type';

export default {
    name: 'PDynamicLayoutRaw',
    components: { PRawData, PPanelTop },
    props: {
        name: {
            type: String,
            required: true,
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
    },
    setup(props: RawDynamicLayoutProps, { emit }) {
        const state = reactive({
            rootData: computed<any[]>(() => {
                if (props.options.root_path) {
                    return get(props.data, props.options.root_path);
                }
                if (typeof props.data !== 'object') return {};
                return props.data;
            }),
            fetchOptionsParam: computed<RawFetchOptions>(() => ({})),
            loading: computed(() => (props.typeOptions?.loading || false)),
        });

        emit('init', state.fetchOptionsParam);

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss">
.p-dynamic-layout-raw {
    @apply w-full;
}
</style>
