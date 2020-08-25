<template>
    <tr class="p-definition">
        <td class="key">
            {{ label || name }}
        </td>
        <td class="value" :class="{hover: isMouseOver}">
            <slot name="default" v-bind="{
                label, name, type, options, data
            }"
            >
                <p-dynamic-field ref="field" :type="type" :options="options"
                                 :data="data"
                />
            </slot>
            <p-copy-button v-if="typeof data !== 'undefined' && data !== '' && data !== null"
                           class="ml-2" width="0.8rem" height="0.8rem"
                           @copy="copy"
                           @mouseover="onMouseOver()" @mouseout="onMouseOut()"
            />
        </td>
    </tr>
</template>

<script lang="ts">
import {
    ref,
} from '@vue/composition-api';
import { DefinitionProps } from '@/components/organisms/definition/type';
import { copyAnyData } from '@/components/util/helpers';
import { mouseOverState } from '@/components/util/composition-helpers';
import PCopyButton from '@/components/molecules/buttons/copy-button/PCopyButton.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';

export default {
    name: 'PDefinition',
    components: { PCopyButton, PDynamicField },
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
    },
    setup(props: DefinitionProps, { emit }) {
        const field = ref<HTMLFormElement|null>(null);

        const copy = (): void => {
            copyAnyData(field.value?.$el.innerText);
            emit('copy');
        };
        return {
            field,
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
