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
import { reactive, watch } from 'vue';

import { PPageTitle, PTextInput } from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';

const props = defineProps<{ name: string; }>();
const emit = defineEmits<{(e: string, value: string): void}>();

const state = reactive({
    name: useProxyValue('name', props, emit),
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
