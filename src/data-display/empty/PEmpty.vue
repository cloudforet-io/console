<template>
    <div class="p-empty">
        <slot name="image">
            <img v-if="props.showImage"
                 alt="empty-default-image"
                 class="image-wrapper"
                 :class="props.imageSize"
                 :src="imgGhost"
            >
        </slot>
        <div class="contents-wrapper">
            <p v-if="props.title"
               class="title"
            >
                {{ props.title }}
            </p>
            <slot name="default" />
        </div>
        <slot name="button">
            <p-button v-if="props.showButton"
                      class="button-wrapper"
                      :style-type="props.buttonStyleType"
                      @click.stop="handleClickButton"
            >
                {{ props.buttonTitle }}
            </p-button>
        </slot>
    </div>
</template>

<script setup lang="ts">

import imgGhost from '@/data-display/empty/assets/img_ghost.png';
import { EmptyImageSize } from '@/data-display/empty/type';
import PButton from '@/inputs/buttons/button/PButton.vue';
import type { ButtonStyle } from '@/inputs/buttons/button/type';
import { BUTTON_STYLE } from '@/inputs/buttons/button/type';

interface EmptyProps {
    showImage?: boolean;
    imageSize?: EmptyImageSize;
    title?: string;
    showButton?: boolean;
    buttonStyleType?: ButtonStyle;
    buttonTitle?: string;
}

const props = withDefaults(defineProps<EmptyProps>(), {
    imageSize: EmptyImageSize.sm,
    title: '',
    buttonStyleType: BUTTON_STYLE.substitutive,
    buttonTitle: 'Button',
});
const emit = defineEmits<{(e: 'click-button'): void;}>();
const handleClickButton = () => {
    emit('click-button');
};
</script>

<style lang="postcss">
.p-empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @apply text-gray-300;

    .image-wrapper {
        margin-bottom: 1.5rem;
        &.sm {
            width: 5rem;
            height: 5rem;
        }
        &.md {
            width: 8rem;
            height: 8rem;
        }
    }
    .contents-wrapper {
        text-align: center;

        @apply text-label-md;

        .title {
            @apply font-bold text-violet-300;
        }
    }
    .button-wrapper {
        margin-top: 1rem;
    }
}
</style>
