<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PI } from '@spaceone/design-system';

import { i18n } from '@/translations';

interface Props {
    value: string;
    isFocused: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    value: '',
    isFocused: false,
});


const state = reactive({
    inputRef: null as null|HTMLElement,
    placeholder: computed(() => (i18n.t('COMMON.GNB.SEARCH.SERACH'))),
});

watch(() => props.isFocused, (isFocused) => {
    if (!state.inputRef) return;
    if (isFocused) state.inputRef.focus();
    else state.inputRef.blur();
});


</script>

<template>
    <div class="gnb-search-input"
         @click.stop="$emit('click')"
    >
        <p-i v-if="!props.isFocused"
             name="ic_search"
             height="1.5rem"
             width="1.5rem"
             color="inherit"
        />
        <input ref="inputRef"
               :value="props.value"
               :placeholder="state.placeholder"
               @input="$emit('input', $event.target.value)"
               @focus="$emit('update:isFocused', true)"
               @blur="$emit('update:isFocused', false)"
               @keyup.esc="$emit('esc')"
               @keydown.up="$emit('arrow-up')"
               @keydown.down="$emit('arrow-down')"
        >
        <p-i v-if="props.value"
             name="ic_close"
             height="1rem"
             width="1rem"
             color="inherit"
             class="delete-button"
             @click.stop="$emit('input', '')"
        />
    </div>
</template>

<style lang="postcss" scoped>
.gnb-search-input {
    @apply flex items-center border border-transparent bg-gray-100 rounded-full text-gray-400;
    width: 17.5rem;
    height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.875rem;

    &:hover {
        @apply bg-secondary-2;
    }

    &:focus-within {
        @apply border-secondary-1 bg-secondary-2;
        box-shadow: 0 0 0 2px rgba(73, 167, 247, 0.2);
    }

    input {
        @apply flex-grow text-gray-900;
        background-color: inherit;

        &::placeholder {
            @apply text-gray-400;
        }
    }

    .delete-button {
        @apply text-gray-400;
        cursor: pointer;
    }
}

@screen laptop {
    .gnb-search-input {
        width: calc(100% - 1.5rem);
        margin-left: 0.75rem;
        margin-right: 0.75rem;
    }
}
</style>
