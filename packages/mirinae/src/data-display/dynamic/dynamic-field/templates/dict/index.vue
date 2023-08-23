<template>
    <span>
        <p-link v-if="options.link"
                :href="options.link"
        >
            <p-tag v-for="([objKey, objValue], idx) in Object.entries(state.dictData)"
                   :key="`tag-${idx}-${objKey}`"
                   :key-item="{ name: objKey, label: objKey }"
                   :value-item="{ name: objValue, label: `${options.prefix || ''}${objValue}${options.postfix || ''}` }"
                   :deletable="false"
            />
        </p-link>
        <template v-else>
            <p-tag v-for="([objKey, objValue], idx) in Object.entries(state.dictData)"
                   :key="`tag-${idx}-${objKey}`"
                   :key-item="{ name: objKey, label: objKey }"
                   :value-item="{ name: objValue, label: `${options.prefix || ''}${objValue}${options.postfix || ''}` }"
                   :deletable="false"
            />
        </template>
    </span>
</template>
<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import type { DictDynamicFieldProps } from '@/data-display/dynamic/dynamic-field/templates/dict/type';
import PTag from '@/data-display/tags/PTag.vue';
import PLink from '@/inputs/link/PLink.vue';

const props = withDefaults(defineProps<DictDynamicFieldProps>(), {
    options: () => ({}),
    typeOptions: () => ({}),
    extraData: () => ({}),
});

const state = reactive({
    dictData: computed(() => (props.data === undefined || props.data === null ? props.options.default : props.data)),
});

</script>
