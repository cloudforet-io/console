<template>
    <div class="generate-id-format">
        <p-button style-type="tertiary"
                  class="generate-button"
                  :disabled="disabled"
                  @click="handleClickGenerate"
        >
            {{ $t('COMPONENT.JSON_SCHEMA_FORM.GENERATE') }}
        </p-button>
        <p-text-input :value="value"
                      :invalid="invalid"
                      @update:value="handleUpdateValue"
        >
            <template #right-edge>
                <p-copy-button :value="value" />
            </template>
        </p-text-input>
    </div>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    defineComponent,
} from 'vue';

import { v4 as uuidV4 } from 'uuid';

import PButton from '@/inputs/buttons/button/PButton.vue';
import PCopyButton from '@/inputs/buttons/copy-button/PCopyButton.vue';
import PTextInput from '@/inputs/input/text-input/PTextInput.vue';

interface Props {
    value?: string;
    disabled?: boolean;
}

export default defineComponent<Props>({
    name: 'GenerateIdFormat',
    components: {
        PTextInput,
        PCopyButton,
        PButton,
    },
    props: {
        value: {
            type: String,
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const handleClickGenerate = () => {
            emit('update:value', uuidV4());
        };

        const handleClickDelete = () => {
            emit('update:value', '');
        };

        const handleUpdateValue = (value?: string) => {
            emit('update:value', value?.trim());
        };

        return {
            handleClickGenerate,
            handleClickDelete,
            handleUpdateValue,
        };
    },
});
</script>

<style lang="postcss">
.generate-id-format {
    display: flex;
    align-items: center;
    max-width: 100%;
    overflow: hidden;
    > .generate-button {
        margin-right: 0.5rem;
        flex-shrink: 0;
    }
    > .p-text-input > .input-container {
        .p-copy-button {
            display: inline-flex;
            margin-left: 0.25rem;
        }
    }
}
</style>
