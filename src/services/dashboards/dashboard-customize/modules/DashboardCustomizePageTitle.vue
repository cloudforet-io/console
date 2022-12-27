<template>
    <p-page-title child
                  @goBack="$router.go(-1)"
    >
        <template #title>
            <p-text-input v-if="state.editMode"
                          :value.sync="state.titleInput"
                          @keydown.esc="handleEscape"
                          @keydown.enter="handleEnter"
            />
            <span v-else
                  class="title-area"
                  @click="handleClickTitle"
            >
                {{ state.title }}
            </span>
        </template>
    </p-page-title>
</template>
<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PPageTitle, PTextInput } from '@spaceone/design-system';

const props = defineProps<{ title: string; }>();
const emit = defineEmits(['update:title']);

const state = reactive({
    title: computed({
        get: () => props.title,
        set: (val: string) => emit('update:title', val),
    }),
    titleInput: props.title,
    editMode: false,
});

const handleClickTitle = () => {
    state.editMode = true;
};
const handleEscape = () => {
    state.editMode = false;
    state.titleInput = props.title;
};
const handleEnter = () => {
    state.editMode = false;
    state.title = state.titleInput;
};

watch(() => props.title, (title) => {
    state.titleInput = title;
});
</script>

<style scoped lang="postcss">
.title-area {
    cursor: pointer;
}
</style>
