<template>
    <tr class="p-definition">
        <td class="key">
            {{ label || name }}
        </td>
        <td ref="field" class="value" :class="{hover: isMouseOver}">
            <slot name="default" v-bind="{...$props, ...$data}">
                {{ displayData }}
            </slot>
            <slot v-if="showCopy"
                  name="copy" v-bind="{...$props, ...$data}"
            >
                <p-copy-button class="ml-2" width="0.8rem" height="0.8rem"
                               @copy="copy"
                               @mouseover="onMouseOver()" @mouseout="onMouseOut()"
                />
            </slot>
        </td>
    </tr>
</template>

<script lang="ts">
import {
    computed,
    ref,
} from '@vue/composition-api';
import { DefinitionProps } from '@/components/organisms/definition/type';
import { copyAnyData, copyTextToClipboard, isNotEmpty } from '@/components/util/helpers';
import { mouseOverState } from '@/components/util/composition-helpers';
import PCopyButton from '@/components/molecules/buttons/copy-button/PCopyButton.vue';

export default {
    name: 'PDefinition',
    components: { PCopyButton },
    props: {
        name: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            default: '',
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        options: {
            type: Object,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            default: (): any => ({}),
        },
        type: {
            type: String,
            default: 'text',
        },
        disableCopy: {
            type: Boolean,
            default: undefined,
        },
        formatter: {
            type: Function,
            default: undefined,
        },
    },
    setup(props: DefinitionProps, { emit }) {
        const field = ref<HTMLFormElement|null>(null);
        const displayData = computed(() => (props.formatter ? props.formatter(props.data, props) : props.data));
        const showCopy = computed(() => !props.disableCopy && isNotEmpty(displayData.value));

        const copy = (): void => {
            if (props.formatter) copyAnyData(props.formatter(props.data, props));
            else copyAnyData(field.value?.innerText);
            emit('copy', props);
        };
        return {
            field,
            displayData,
            showCopy,
            copy,
            ...mouseOverState(),
        };
    },
};
</script>

<style lang="postcss">
.p-definition {
    @apply flex;
    .key {
        @apply font-bold;
        width: 18rem;
    }
    .value {
        @apply inline-flex items-center flex-grow cursor-text;
        flex-wrap: wrap;
        max-width: calc(100% - 18rem);
        &.hover {
            @apply text-blue-500;
        }
    }
    .key, .value {
        @apply py-2 px-4 text-sm;
        line-height: 1.45;
        cursor: unset;
    }
}
</style>
