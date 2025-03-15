<template>
    <div class="p-dynamic-layout-raw">
        <p-heading v-if="layoutName"
                   class="pt-8 px-4 pb-4"
                   heading-type="sub"
        >
            {{ layoutName }}
        </p-heading>
        <p-code-editor class="m-4"
                       :code="rootData"
                       :loading="loading"
                       folded
                       read-only
        />
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import PCodeEditor from '@/controls/code-editor/PCodeEditor.vue';
import type { DynamicLayoutFetchOptions, DynamicLayoutTypeOptions } from '@/data-display/dynamic/dynamic-layout/type';
import type { RawOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PHeading from '@/data-display/heading/PHeading.vue';


export default defineComponent({
    name: 'PDynamicLayoutRaw',
    components: {
        PHeading,
        PCodeEditor,
    },
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Object as PropType<RawOptions>,
            default: () => ({}),
        },
        data: {
            type: [Object, Array, String],
            default: undefined,
        },
        fetchOptions: {
            type: Object as PropType<DynamicLayoutFetchOptions>,
            default: undefined,
        },
        typeOptions: {
            type: Object as PropType<DynamicLayoutTypeOptions>,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;

        const state = reactive({
            layoutName: computed(() => (props.options.translation_id ? vm.$t(props.options.translation_id) : props.name)),
            rootData: computed<any>(() => {
                if (props.options.root_path) {
                    const rootData = getValueByPath(props.data, props.options.root_path) ?? {};
                    return rootData;
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
});
</script>

<style lang="postcss">
.p-dynamic-layout-raw {
    @apply w-full;
}
</style>
