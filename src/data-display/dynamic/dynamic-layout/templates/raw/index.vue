<template>
    <div class="p-dynamic-layout-raw">
        <p-panel-top v-if="layoutName">
            {{ layoutName }}
        </p-panel-top>
        <p-text-editor class="m-4" :code="rootData" :loading="loading"
                       folded read-only
        />
    </div>
</template>

<script lang="ts">
import type { ComponentRenderProxy } from '@vue/composition-api';
import {
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import type { RawDynamicLayoutProps } from '@/data-display/dynamic/dynamic-layout/templates/raw/type';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PPanelTop from '@/data-display/titles/panel-top/PPanelTop.vue';
import PTextEditor from '@/inputs/text-editor/PTextEditor.vue';

export default {
    name: 'PDynamicLayoutRaw',
    components: { PTextEditor, PPanelTop },
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
    setup(props: RawDynamicLayoutProps) {
        const vm = getCurrentInstance()?.proxy as ComponentRenderProxy;

        const state = reactive({
            layoutName: computed(() => (props.options.translation_id ? vm.$t(props.options.translation_id) : props.name)),
            rootData: computed<any[]>(() => {
                if (props.options.root_path) {
                    const rootData = getValueByPath(props.data, props.options.root_path) ?? [];
                    return Array.isArray(rootData) ? rootData : [rootData];
                }
                if (props.data === null || props.data === undefined) return {};
                return props.data;
            }),
            loading: computed(() => (props.typeOptions?.loading || false)),
        });


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
