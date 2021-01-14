<template>
    <div class="p-dynamic-layout-raw">
        <p-panel-top v-if="layoutName">
            {{ layoutName }}
        </p-panel-top>
        <p-raw-data class="m-4" :item="rootData" :loading="loading"
                    folded
        />
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { get } from 'lodash';
import PRawData from '@/organisms/raw-data/PRawData.vue';
import PPanelTop from '@/molecules/panel/panel-top/PPanelTop.vue';
import { RawDynamicLayoutProps, RawFetchOptions } from '@/organisms/dynamic-layout/templates/raw/type';

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
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            layoutName: computed(() => (props.options.translation_id ? vm.$t(props.options.translation_id) : props.name)),
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
