<template>
    <div class="p-empty">
        <div v-if="props.showImage"
             class="image-wrapper"
             :class="props.imageSize"
        >
            <slot name="image">
                <img
                    alt="empty-default-image"
                    :src="imgGhost"
                >
            </slot>
        </div>
        <div class="contents-wrapper">
            <p v-if="props.title"
               class="title"
            >
                {{ props.title }}
            </p>
            <p class="description">
                <slot name="default" />
            </p>
        </div>
        <div
            v-if="props.showButton"
            class="button-wrapper"
        >
            <slot name="button">
                <p-button
                    :style-type="props.buttonStyleType"
                    @click.stop="handleClickButton"
                >
                    {{ props.buttonTitle }}
                </p-button>
            </slot>
        </div>
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
            > img {
                width: 5rem;
                height: 5rem;
            }
        }
        &.md {
            width: 8rem;
            height: 8rem;
            > img {
                width: 8rem;
                height: 8rem;
            }
        }
        &.lg {
            width: 12rem;
            height: 12rem;
            > img {
                width: 12rem;
                height: 12rem;
            }
        }
    }
    .contents-wrapper {
        @apply text-paragraph-md;
        text-align: center;

        .title {
            @apply font-bold text-violet-300;
        }
    }
    .button-wrapper {
        margin-top: 1rem;
        .p-button {
            min-width: auto;
            width: fit-content;
            max-width: 100%;
        }
    }
}
</style>
