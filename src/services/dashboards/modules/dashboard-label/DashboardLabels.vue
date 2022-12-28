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
                       @click="handleClickPlus"
        />
        <p-text-input v-if="state.inputMode"
                      v-model="state.inputText"
                      :invalid="state.inputTextInvalid"
        />

        <span v-if="!state.inputMode && !state.labelList.length && props.editable"
              class="dashboard-labels-add-info"
        >
            {{ $t('DASHBOARDS.CUSTOMIZE.ADD_LABEL') }}
        </span>
    </div>
</template>

<script setup lang="ts">
// this vOnClickOutside is using !! Please do not remove.
import { vOnClickOutside } from '@vueuse/components';
import { computed, reactive } from 'vue';

import { Keyboard } from '@amcharts/amcharts4/core';
import { PIconButton, PLabel, PTextInput } from '@spaceone/design-system';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';


interface Props {
    labelList: Array<string>;
    editable?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits(['update:labelList']);

const state = reactive({
    labelList: computed<Array<string>>({
        get: () => props.labelList,
        set(val: Array<string>) { emit('update:labelList', val); },
    }),
    inputMode: false,
    inputText: '',
    inputTextInvalid: false,
});

const handleClickPlus = () => {
    state.inputMode = true;
};
const handleEscape = () => {
    state.inputMode = false;
    state.inputText = '';
};
const handlePushLabel = (e: KeyboardEvent) => {
    if (e.isComposing || !state.inputText) return;
    if (state.labelList.find((d) => d === state.inputText)) {
        state.inputTextInvalid = true;
        return;
    }
    state.labelList.push(state.inputText);
    state.inputText = '';
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
    align-items: center;
    height: 100%;
    max-width: 50%;
}
.p-icon-button {
    margin-right: 0.25rem;
}

.dashboard-labels-add-info {
    @apply text-gray-500 text-xs;
}
.p-text-input {
    height: 1.5rem;
}
</style>
