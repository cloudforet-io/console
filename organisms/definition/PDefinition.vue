<template>
    <tr>
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
            <p-copy-button v-if="typeof data !== 'undefined' && data !== ''"
                           class="ml-2" @copy="copy"
                           @mouseover="onMouseOver()" @mouseout="onMouseOut()"
            />
        </td>
    </tr>
</template>

<script lang="ts">
import {
    ref,
} from '@vue/composition-api';
import { definitionProps } from '@/components/organisms/definition/PDefinition.toolset';
import { copyAnyData } from '@/components/util/helpers';
import { mouseOverState } from '@/components/util/composition-helpers';
import PCopyButton from '@/components/molecules/buttons/copy-button/PCopyButton.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';

export default {
    name: 'PDefinition',
    components: { PCopyButton, PDynamicField },
    props: definitionProps,
    setup(props, { emit }) {
        const field = ref<HTMLFormElement>(null);

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

<style lang="postcss" scoped>
.key {
    @apply font-bold;
    width: 18rem;
}
.value {
    @apply cursor-text;
    &.hover {
        @apply text-blue-500;
    }
}
.key, .value {
    @apply py-2 px-4 text-sm;
    line-height: 1.45;
    cursor: unset;
}

</style>
