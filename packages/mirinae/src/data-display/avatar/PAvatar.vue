<script setup lang="ts">
import { computed, reactive } from 'vue';

import type { SizeType } from '@/data-display/avatar/type';
import { AVATAR_SIZE, AVATAR_COLOR, ICON_SIZE } from '@/data-display/avatar/type';
import PLazyImg from '@/feedbacks/loading/lazy-img/PLazyImg.vue';
import PI from '@/foundation/icons/PI.vue';

import { indigo } from '@/styles/colors.cjs';

interface AvatarProps {
    color?: string;
    size?: SizeType;
    icon?: string;
    imgSrc?: string;
}

const props = withDefaults(defineProps<AvatarProps>(), {
    imgSrc: '',
    icon: 'ic_avatar-filled',
    color: indigo[200],
    size: AVATAR_SIZE.MD,
});

const state = reactive({
    iconSize: computed(() => ICON_SIZE[props.size]),
    avatarInlineStyles: computed(() => {
        const iconSize = ICON_SIZE[props.size];

        return {
            width: iconSize,
            height: iconSize,
        };
    }),
    wrapperInlineStyles: computed(() => ({ backgroundColor: AVATAR_COLOR[props.color] || props.color })),
});
</script>

<template>
    <div class="p-avatar"
         :style="state.avatarInlineStyles"
    >
        <p-lazy-img v-if="props.imgSrc"
                    :src="props.imgSrc"
                    :width="state.iconSize"
                    :height="state.iconSize"
        />
        <div v-else
             :class="['icon-wrapper', `avatar-${props.size}`]"
             :style="state.wrapperInlineStyles"
        >
            <p-i :name="props.icon"
                 color="inherit"
                 width="100%"
                 height="100%"
            />
        </div>
    </div>
</template>

<style lang="postcss">
.p-avatar {
    @apply rounded-full overflow-hidden;

    .p-i-icon {
        display: block;
    }

    .icon-wrapper {
        @apply text-white;

        &.avatar-sm, &.avatar-md {
            padding: 0.25rem;
        }

        &.avatar-xl {
            padding: 0.5rem;
        }
    }
}
</style>
