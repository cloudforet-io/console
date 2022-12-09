<template>
    <div class="dashboard-labels"
         @keydown="handleKeydown"
    >
        <p-label
            v-for="({ label }, index) in state.labelList"
            :key="`dashboard-label-${index}`"
            :text="label"
            :deleteable="props.deleteable"
        />
        <p-icon-button v-if="!state.inputMode"
                       style-type="tertiary"
                       name="ic_plus_bold"
                       size="sm"
                       @click="handleClickPlus"
        />
        <p-text-input v-if="state.inputMode"
                      v-model="state.inputText"
        />

        <!--            song-lang-->
        <span v-if="!state.inputMode && !state.labelList.length"
              class="dashboard-labels-add-info"
        >
            Click + button to add dashboard's label
        </span>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { PIconButton, PLabel, PTextInput } from '@spaceone/design-system';


interface Props {
    labelList: Array<{label: string}>;
    deleteable: boolean;
}
const props = defineProps<Props>();

const state = reactive({
    // labelList: props.labelList,
    // labelList: [{ label: 'AWS' }, { label: 'Taco' }],
    labelList: [] as Array<{label: string}>,
    inputMode: false,
    inputText: '',
});


const handleClickPlus = () => {
    state.inputMode = true;
};
const handleKeydown = ({ key }: KeyboardEvent) => {
    if (key === 'Escape') {
        state.inputMode = false;
        state.inputText = '';
    }
    if (key === 'Enter') {
        state.labelList.push({ label: state.inputText });
        state.inputText = '';
    }
};
</script>
<style lang="postcss" scoped>
.dashboard-labels {
    display: flex;
    align-items: center;
    height: 1.5rem;
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
