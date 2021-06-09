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
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { DefinitionProps } from '@/data-display/tables/definition-table/definition/type';
import { copyAnyData, copyTextToClipboard, isNotEmpty } from '@/util/helpers';
import PCopyButton from '@/inputs/buttons/copy-button/PCopyButton.vue';
import { mouseOverState } from '@/hooks/mouse-over-state';

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
        const searchElemInnerText = (elem: HTMLElement): string => elem.innerText;
        const state = reactive({
            field: null as HTMLFormElement|null,
            displayData: computed(() => (props.formatter ? props.formatter(props.data, props) : props.data)),
            showCopy: computed(() => {
                if (props.disableCopy) return false;
                if (slots.default) return isNotEmpty(state.displayData);
                if (state.field) return !!searchElemInnerText(state.field);
                return true;
            }),
        });

        const copy = (): void => {
            if (props.formatter) copyAnyData(props.formatter(props.data, props));
            else if (state.field) copyTextToClipboard(searchElemInnerText(state.field));
            emit('copy', props);
        };

        return {
            ...toRefs(state),
            ...mouseOverState(),
            copy,
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
