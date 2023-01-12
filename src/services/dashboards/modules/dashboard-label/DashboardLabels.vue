<template>
    <div v-on-click-outside="handleEscape"
         class="dashboard-labels"
         @keydown.esc="handleEscape"
         @keydown.enter="handlePushLabel"
    >
        <p-label
            v-for="(label, index) in state.labelList"
            :key="`dashboard-label-${index}`"
            :text="label"
            :deletable="props.editable"
            @delete="handleDelete(index)"
        />
        <p-icon-button v-if="!state.inputMode && props.editable"
                       style-type="tertiary"
                       name="ic_plus_bold"
                       size="sm"
                       shape="square"
                       @click="handleClickPlus"
        />
        <p-field-group
            v-if="state.inputMode"
            :invalid="invalidState.inputText"
            :invalid-text="invalidTexts.inputText"
        >
            <p-text-input
                :value="inputText"
                :invalid="invalidState.inputText"
                @update:value="setForm('inputText', $event)"
            />
        </p-field-group>
        <span v-if="!state.inputMode && !state.labelList.length && props.editable"
              class="dashboard-labels-add-info"
        >
            {{ $t('DASHBOARDS.CUSTOMIZE.ADD_LABEL') }}
        </span>
    </div>
</template>

<script setup lang="ts">
// CAUTION: this vOnClickOutside is using !! Please do not remove.
import { vOnClickOutside } from '@vueuse/components';
import { computed, reactive } from 'vue';

import {
    PFieldGroup, PIconButton, PLabel, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';


interface Props {
    labelList: Array<string>;
    editable?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits(['update:labelList']);


const {
    forms: {
        inputText,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    inputText: '',
}, {
    inputText(value: string) { return !state.labelList.find((d) => d === value) ? '' : i18n.t('DASHBOARDS.CUSTOMIZE.VALIDATION_DUPLICATED_LABEL'); },
});

const state = reactive({
    labelList: computed<Array<string>>({
        get: () => props.labelList,
        set(val: Array<string>) { emit('update:labelList', val); },
    }),
    inputMode: false,
});

const handleClickPlus = () => {
    state.inputMode = true;
};
const handleEscape = () => {
    state.inputMode = false;
    setForm('inputText', '');
};
const handlePushLabel = (e: KeyboardEvent) => {
    if (e.isComposing || !inputText.value || invalidState.inputText) return;
    state.labelList.push(inputText.value);
    setForm('inputText', '');
    emit('update:labelList', state.labelList);
};
const handleDelete = (index: number) => {
    state.labelList.splice(index, 1);
    emit('update:labelList', state.labelList);
};

</script>
<style lang="postcss" scoped>
.dashboard-labels {
    display: flex;
    flex-flow: wrap;
    max-width: 50%;
    min-height: 2.75rem;
}
.p-icon-button {
    margin-right: 0.25rem;
}

.dashboard-labels-add-info {
    @apply text-gray-500 text-xs pt-1;
}

.p-label {
    margin-bottom: 0.375rem;
}
.p-field-group {
    height: 2.75rem;
    margin-bottom: 0;
}

/* custom design-system component - p-text-input */
:deep(.p-text-input) {
    .input-container {
        min-height: 1.5rem;
    }
}
</style>
