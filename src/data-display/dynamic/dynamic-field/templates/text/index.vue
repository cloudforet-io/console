<template>
    <span class="p-dynamic-field-text">
        <p-anchor v-if="isAnchor"
                  v-bind="anchorProps"
        />
        <template v-else>{{ text }}</template>
    </span>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

import type { TranslateResult } from 'vue-i18n';

import type { TextDynamicFieldProps } from '@/data-display/dynamic/dynamic-field/templates/text/type';
import type { TextOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PAnchor from '@/inputs/anchors/PAnchor.vue';
import { commaFormatter } from '@/utils/helpers';

export default defineComponent<TextDynamicFieldProps>({
    name: 'PDynamicFieldText',
    components: { PAnchor },
    props: {
        options: {
            type: Object as PropType<TextOptions>,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: null,
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
        const isAnchor = computed(() => props.options?.link);
        const text = computed<TranslateResult|number>(() => {
            let textValue: TranslateResult|number;
            if (props.data === null || props.data === undefined) {
                textValue = props.options?.default === undefined ? '' : props.options?.default;
            } else if (typeof props.data === 'number') {
                textValue = commaFormatter(props.data) ?? '';
            } else {
                textValue = typeof props.data === 'string' ? props.data : JSON.stringify(props.data);
            }
            return `${props.options.prefix ?? ''}${textValue}${props.options.postfix ?? ''}`;
        });
        const anchorProps = computed(() => {
            if (props.options.link) {
                return {
                    href: props.options?.link,
                    target: '_blank',
                    text: text.value,
                    showIcon: !!text.value,
                };
            }
            return {};
        });
        return {
            isAnchor,
            text,
            anchorProps,
        };
    },
});
</script>
