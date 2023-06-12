<template>
    <div class="p-dynamic-layout-raw">
        <p-heading v-if="state.layoutName"
                   heading-type="sub"
        >
            {{ state.layoutName }}
        </p-heading>
        <p-text-editor class="m-4"
                       :code="state.rootData"
                       :loading="state.loading"
                       folded
                       read-only
        />
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import type { RawDynamicLayoutProps } from '@/data-display/dynamic/dynamic-layout/templates/raw/type';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PHeading from '@/data-display/heading/PHeading.vue';
import PTextEditor from '@/inputs/text-editor/PTextEditor.vue';

const props = withDefaults(defineProps<RawDynamicLayoutProps>(), {
    options: () => ({}),
});
const { t } = useI18n();

const state = reactive({
    layoutName: computed(() => (props.options.translation_id ? t(props.options.translation_id) : props.name)),
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

</script>

<style lang="postcss">
.p-dynamic-layout-raw {
    @apply w-full;
}
</style>
