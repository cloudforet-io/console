<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton, PDivider, PFieldTitle, PIconButton,
} from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    isFullMode: boolean,
}

const props = withDefaults(defineProps<Props>(), {
    isFullMode: false,
});

const emit = defineEmits<{(event: 'update:isFullMode', value: boolean): void}>();

const state = reactive({
    // TODO: will be changed to data
    buttons: computed(() => [
        { label: 'tab1', value: 'tab1' },
        { label: 'tab2', value: 'tab2' },
        { label: 'tab3', value: 'tab3' },
    ]),
    activeButton: 'my-bookmark',
    proxyIsFullMode: useProxyValue('isFullMode', props, emit),
});

const handleClickFullModeButton = () => {
    state.proxyIsFullMode = !state.proxyIsFullMode;
};
</script>

<template>
    <div class="bookmark-header">
        <p-field-title :label="$t('HOME.BOOKMARK_TITLE')"
                       size="lg"
        />
        <div v-if="!state.proxyIsFullMode"
             class="bookmark-folders-wrapper"
        >
            <div class="bookmark-folders">
                <p-button v-for="(item, idx) in state.buttons"
                          :key="idx"
                          icon-left="ic_folder-filled"
                          style-type="tertiary"
                          class="folders-button"
                >
                    {{ item.label }}
                </p-button>
            </div>
            <p-divider vertical
                       class="divider"
            />
            <p-icon-button name="ic_plus"
                           style-type="tertiary"
                           shape="square"
                           size="sm"
            />
        </div>
        <div class="toolbox-wrapper">
            <p-button icon-left="ic_plus"
                      :style-type="!state.proxyIsFullMode ? 'tertiary' : 'substitutive'"
            >
                {{ $t('HOME.BOOKMARK_ADD_LINK') }}
            </p-button>
            <p-icon-button v-if="!state.proxyIsFullMode"
                           name="ic_chevron-down"
                           shape="square"
                           size="md"
                           :activated="false"
                           @click="handleClickFullModeButton"
            />
            <p-icon-button v-else
                           name="ic_close"
                           shape="square"
                           size="md"
                           :activated="false"
                           @click="handleClickFullModeButton"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.bookmark-header {
    @apply flex items-center;
    padding-bottom: 1rem;
    gap: 0.5rem;
    .bookmark-folders-wrapper {
        @apply flex items-center;
        margin-left: 0.25rem;
        gap: 0.75rem;
        flex: 1;
        .bookmark-folders {
            @apply flex;
            gap: 0.25rem;
            .folders-button {
                @apply font-normal text-label-md bg-gray-150;
                height: 1.625rem;
                padding: 0.25rem 0.625rem;
                border: none;
            }
        }
        .divider {
            height: 1.25rem;
        }
    }
    .toolbox-wrapper {
        @apply flex;
        margin-left: auto;
        gap: 0.5rem;
    }
}
</style>
