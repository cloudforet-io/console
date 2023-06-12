<template>
    <div class="generate-id-format">
        <p-button style-type="tertiary"
                  class="generate-button"
                  :disabled="disabled"
                  @click="handleClickGenerate"
        >
            {{ t('COMPONENT.JSON_SCHEMA_FORM.GENERATE') }}
        </p-button>
        <p-text-input :value="value"
                      :invalid="invalid"
                      :style="{ width: fullWidth ? '100%' : undefined }"
                      @update:value="handleUpdateValue"
        >
            <template #right-edge>
                <p-copy-button :value="value" />
            </template>
        </p-text-input>
    </div>
</template>

<script setup lang="ts">

import { v4 as uuidV4 } from 'uuid';
import { useI18n } from 'vue-i18n';

import PButton from '@/inputs/buttons/button/PButton.vue';
import PCopyButton from '@/inputs/buttons/copy-button/PCopyButton.vue';
import PTextInput from '@/inputs/input/text-input/PTextInput.vue';

interface Props {
    value?: string;
    disabled?: boolean;
    invalid?: boolean;
    fullWidth?: boolean;
}

withDefaults(defineProps<Props>(), {
    value: undefined,
    disabled: false,
    invalid: false,
    fullWidth: false,
});
const emit = defineEmits(['update:value']);
const { t } = useI18n();

const handleClickGenerate = () => {
    emit('update:value', uuidV4());
};

const handleUpdateValue = (value?: string) => {
    emit('update:value', value?.trim());
};

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
