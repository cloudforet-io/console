<template>
    <p-page-title child
                  @goBack="$router.go(-1)"
    >
        <template #title>
            <p-text-input v-if="state.editMode"
                          v-on-click-outside="handleEscape"
                          :value.sync="state.nameInput"
                          @keydown.esc="handleEscape"
                          @keydown.enter="handleEnter"
            />
            <span v-else
                  class="title-area"
                  @click="handleClickTitle"
            >
                {{ state.name }}
            </span>
        </template>
    </p-page-title>
</template>
<script setup lang="ts">
// Below directive is used. Do not remove!!!
import { vOnClickOutside } from '@vueuse/components';
import { computed, reactive, watch } from 'vue';

import { PPageTitle, PTextInput } from '@spaceone/design-system';

const props = defineProps<{ name: string; }>();
const emit = defineEmits(['update:name']);

const state = reactive({
    name: computed({
        get: () => props.name,
        set: (val: string) => emit('update:name', val),
    }),
    nameInput: props.name,
    editMode: false,
});

const handleClickTitle = () => {
    state.editMode = true;
};
const handleEscape = () => {
    state.editMode = false;
    state.nameInput = props.name;
};
const handleEnter = () => {
    state.editMode = false;
    state.name = state.nameInput;
};

watch(() => props.name, (name) => {
    state.nameInput = name;
});
</script>

<style scoped lang="postcss">
.title-area {
    cursor: pointer;
}
.title-area:hover {
    text-decoration: underline;
}
</style>
