<template>
    <span>
        <p-anchor v-if="options.link"
                  :href="options.link"
        >
            <p-tag v-for="([objKey, objValue], idx) in Object.entries(dictData)"
                   :key="`tag-${idx}-${objKey}`"
                   :key-item="{ name: objKey, label: objKey }"
                   :value-item="{ name: objValue, label: `${options.prefix || ''}${objValue}${options.postfix || ''}` }"
                   :deletable="false"
            />
        </p-anchor>
        <template v-else>
            <p-tag v-for="([objKey, objValue], idx) in Object.entries(dictData)"
                   :key="`tag-${idx}-${objKey}`"
                   :key-item="{ name: objKey, label: objKey }"
                   :value-item="{ name: objValue, label: `${options.prefix || ''}${objValue}${options.postfix || ''}` }"
                   :deletable="false"
            />
        </template>
    </span>
</template>
<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import type { DictDynamicFieldProps, DictTypeOptions } from '@/data-display/dynamic/dynamic-field/templates/dict/type';
import PTag from '@/data-display/tags/PTag.vue';
import PAnchor from '@/inputs/anchors/PAnchor.vue';

export default defineComponent<DictDynamicFieldProps>({
    name: 'PDynamicFieldDict',
    components: {
        PTag,
        PAnchor,
    },
    props: {
        options: {
            type: Object as PropType<DictTypeOptions>,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        typeOptions: {
            type: Object,
            default: () => ({}),
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        handler: {
            type: Function,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            dictData: computed(() => (props.data === undefined || props.data === null ? props.options.default : props.data)),
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>
