<template>
    <div class="p-dynamic-layout-markdown">
        <p-heading v-if="state.layoutName"
                   heading-type="sub"
        >
            {{ state.layoutName }}
        </p-heading>
        <p-markdown :markdown="options.markdown || ''"
                    :data="state.rootData"
                    :language="state.language"
        />
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import type {
    MarkdownDynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/templates/markdown/type';
import type { MarkdownOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PHeading from '@/data-display/heading/PHeading.vue';
import PMarkdown from '@/data-display/markdown/PMarkdown.vue';

const props = withDefaults(defineProps<MarkdownDynamicLayoutProps>(), {
    options: () => ({}) as MarkdownOptions,
});
const { t } = useI18n();
const state = reactive({
    layoutName: computed(() => (props.options.translation_id ? t(props.options.translation_id) : props.name)),
    rootData: computed<any[]>(() => {
        if (props.options.root_path) {
            return getValueByPath(props.data, props.options.root_path);
        }
        return props.data;
    }),
    language: computed(() => props.typeOptions?.language || 'en'),
});

</script>
