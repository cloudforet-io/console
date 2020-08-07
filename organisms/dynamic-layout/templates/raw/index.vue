<template>
    <div class="w-full">
        <p-panel-top v-if="name">
            {{ name }}
        </p-panel-top>
        <p-raw-data class="mx-4" :item="rootData" />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { get } from 'lodash';
import PRawData from '@/components/organisms/text-editor/raw-data/PRawData.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import { RawDynamicLayoutProps } from '@/components/organisms/dynamic-layout/templates/raw/type';
import { DynamicLayoutFetchOptions } from '@/components/organisms/dynamic-layout/type';

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
            type: [Array, Object],
            default: undefined,
        },
        loading: {
            type: Boolean,
            default: undefined,
        },
        totalCount: {
            type: Number,
            default: undefined,
        },
        timezone: {
            type: String,
            default: undefined,
        },
        initProps: {
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
                return props.data;
            }),
            fetchOptions: computed<DynamicLayoutFetchOptions>(() => ({})),
        });

        emit('init', state.fetchOptions);

        return {
            ...toRefs(state),
        };
    },
};
</script>
