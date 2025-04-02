<template>
    <span class="p-dynamic-field-dict">
        <p-link v-if="options.link"
                :href="options.link"
        >
            <p-tag v-for="([objKey, objValue], idx) in Object.entries(dictData)"
                   :key="`tag-${idx}-${objKey}`"
                   :key-item="{ name: objKey, label: objKey }"
                   :value-item="{ name: objValue, label: `${options.prefix || ''}${objValue}${options.postfix || ''}` }"
                   :deletable="false"
            />
        </p-link>
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

import type { DictTypeOptions } from '@/data-display/dynamic/dynamic-field/templates/dict/type';
import type { DynamicFieldHandler } from '@/data-display/dynamic/dynamic-field/type';
import type { DictOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PTag from '@/data-display/tags/PTag.vue';
import PLink from '@/navigation/link/PLink.vue';

export default defineComponent({
    name: 'PDynamicFieldDict',
    components: {
        PTag,
        PLink,
    },
    props: {
        options: {
            type: Object as PropType<DictOptions>,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        typeOptions: {
            type: Object as PropType<DictTypeOptions>,
            default: () => ({}),
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        handler: {
            type: Function as PropType<DynamicFieldHandler|undefined>,
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
<style lang="postcss">
.p-dynamic-field-dict {
    line-height: 2;
}
</style>
