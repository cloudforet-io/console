<template>
    <tr class="p-definition">
        <td class="key">
            <slot name="key" v-bind="{name, label, data, value: displayData, hoverCopy: isMouseOver, copy}">
                {{ label || name }}
            </slot>
        </td>
        <td class="value-wrapper">
            <span ref="field" class="value" :class="{hover: isMouseOver}">
                <slot name="default" v-bind="{name, label, data, value: displayData, hoverCopy: isMouseOver, copy}">
                    {{ displayData }}
                </slot>
                <p-copy-button v-if="showCopy"
                               width="0.8rem" height="0.8rem"
                               @copy="copy"
                               @mouseover="onMouseOver()" @mouseout="onMouseOut()"
                />
            </span>
            <span class="extra">
                <slot name="extra" v-bind="{name, label, data, value: displayData, hoverCopy: isMouseOver, copy}" />
            </span>
        </td>
    </tr>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import { copyAnyData, copyTextToClipboard, isNotEmpty } from '@/util/helpers';
import PCopyButton from '@/inputs/buttons/copy-button/PCopyButton.vue';
import { mouseOverState } from '@/hooks/mouse-over-state';
import { DefinitionProps } from '@/data-display/tables/definition-table/definition/type';

const searchElemInnerText = (elem: HTMLElement): string => elem.innerText;

export default defineComponent<DefinitionProps>({
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
});
</script>

<style lang="postcss">
.p-definition {
    @apply flex;
    .key {
        @apply font-bold;
        width: 18rem;
    }
    .value-wrapper {
        @apply inline-flex items-center flex-grow cursor-text;
        flex-wrap: wrap;
        max-width: calc(100% - 18rem);
        .value {
            &.hover {
                @apply text-blue-500;
            }
        }
        .p-copy-button {
            @apply ml-2 flex-shrink-0;
        }
        .extra {
            flex-grow: 1;
            flex-shrink: 0;
        }
    }
    .key, .value-wrapper {
        @apply py-2 px-4 text-sm;
        line-height: 1.45;
        cursor: unset;
    }

    @screen mobile {
        flex-wrap: no-wrap;
        flex-direction: column;
        .key, .value-wrapper {
            width: 100%;
            max-width: 100%;
        }
    }
}
</style>
