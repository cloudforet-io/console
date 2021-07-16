<template>
    <tr class="p-definition" :class="{block}">
        <td class="key">
            <slot name="key" v-bind="{name, label, data, value: displayData}">
                {{ label || name }}
            </slot>
        </td>
        <td class="value-wrapper">
            <span class="value">
                <slot v-if="disableCopy" name="default" v-bind="{name, label, data, value: displayData}">
                    {{ displayData }}
                </slot>
                <p-copy-button v-else
                               width="0.8rem" height="0.8rem"
                               auto-hide-icon
                >
                    <slot name="default" v-bind="{name, label, data, value: displayData}">
                        {{ displayData }}
                    </slot>
                </p-copy-button>
            </span>
            <span v-if="$scopedSlots.extra" class="extra">
                <slot name="extra" v-bind="{name, label, data, value: displayData}" />
            </span>
        </td>
    </tr>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import PCopyButton from '@/inputs/buttons/copy-button/PCopyButton.vue';
import { DefinitionProps } from '@/data-display/tables/definition-table/definition/type';

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
        block: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: DefinitionProps) {
        const state = reactive({
            displayData: computed(() => (props.formatter ? props.formatter(props.data, props) : props.data)),
        });


        return {
            ...toRefs(state),
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

        .p-copy-button {
            @apply flex-shrink-0;
        }
        .extra {
            flex-grow: 1;
            flex-shrink: 0;
            margin-left: 0.5rem;
        }
    }
    .key, .value-wrapper {
        @apply py-2 px-4 text-sm;
        line-height: 1.45;
        cursor: unset;
    }

    &.block {
        display: flex;
        .value {
            flex-grow: 1;
        }
        .extra {
            flex-grow: unset;
        }
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
