<template>
    <tr class="p-definition">
        <td class="key">
            {{ label || name }}
        </td>
        <td ref="field" class="value" :class="{hover: isMouseOver}">
            <slot name="default" v-bind="{...$props, ...$data}">
                {{ displayData }}
            </slot>
            <slot name="copy" v-bind="{...$props, ...$data}">
                <p-copy-button v-if="showCopy"
                               class="ml-2" width="0.8rem" height="0.8rem"
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
import { DefinitionProps } from '@/data-display/tables/definition-table/definition/type';
import { copyAnyData, copyTextToClipboard, isNotEmpty } from '@/util/helpers';
import { mouseOverState } from '@/util/composition-helpers';
import PCopyButton from '@/inputs/buttons/copy-button/PCopyButton.vue';

export default {
    name: 'PDefinition',
    components: { PCopyButton },
    props: {
        name: {
            type: String,
            default: '',
        },
        label: {
            type: String,
            default: '',
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
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
    setup(props: DefinitionProps, { emit, slots }) {
        const field = ref<HTMLFormElement|null>(null);
        const displayData = computed(() => (props.formatter ? props.formatter(props.data, props) : props.data));
        const searchElemInnerText = (elem: HTMLElement): string => elem.innerText;

        const showCopy = computed(() => {
            if (props.disableCopy) return false;
            if (slots.default) return isNotEmpty(displayData.value);
            if (field.value) return !!searchElemInnerText(field.value);
            return true;
        });

        const copy = (): void => {
            if (props.formatter) copyAnyData(props.formatter(props.data, props));
            else if (field.value) copyTextToClipboard(searchElemInnerText(field.value));
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
