<script setup lang="ts">
import { computed, reactive } from 'vue';

import { get, isNull } from 'lodash';

import type { SizeType, ColorType } from '@/data-display/avatar/type';
import { AVATAR_SIZE, AVATAR_COLOR, ICON_SIZE } from '@/data-display/avatar/type';
import PLazyImg from '@/feedbacks/loading/lazy-img/PLazyImg.vue';
import PI from '@/foundation/icons/PI.vue';


import colors from '@/styles/colors.cjs';

interface AvatarProps {
    color?: ColorType;
    size?: SizeType;
    icon?: string;
    imgSrc?: string;
}

const props = withDefaults(defineProps<AvatarProps>(), {
    imgSrc: '',
    icon: 'ic_avatar-filled',
    color: AVATAR_COLOR.INDIGO_200,
    size: AVATAR_SIZE.MD,
});

const state = reactive({
    imgSrc: computed(() => props.imgSrc),
    iconName: computed(() => props.icon),
    iconSize: computed(() => ICON_SIZE[props.size]),
    avatarInlineStyles: computed(() => {
        const iconSize = ICON_SIZE[props.size];

        return {
            width: iconSize,
            height: iconSize,
        };
    }),
    wrapperInlineStyles: computed(() => {
        const defaultStyle = { backgroundColor: AVATAR_COLOR.INDIGO_200 };

        const colorNum = props.color.match(/\d{3}/)?.[0];

        if (isNull(colorNum)) {
            return defaultStyle;
        }

        const colorStr = props.color.match(/[a-z]+/)?.[0];

        if (isNull(colorStr)) {
            return defaultStyle;
        }

        const color = get(colors, `${colorStr}[${colorNum}]`);

        return {
            backgroundColor: color,
        };
    }),
});
</script>

<template>
    <div class="p-avatar"
         :style="state.avatarInlineStyles"
    >
        <p-lazy-img v-if="state.imgSrc"
                    :src="state.imgSrc"
                    :width="state.iconSize"
                    :height="state.iconSize"
        />
        <div v-else
             :class="['icon-wrapper', `avatar-${props.size}`]"
             :style="state.wrapperInlineStyles"
        >
            <p-i :name="state.iconName"
                 color="inherit"
                 width="100%"
                 height="100%"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.p-avatar {
    /* custom design-system component - p-i-icon */
    :deep(.p-i-icon) {
        display: block;
    }

    /* custom design-system component - p-lazy-img */
    :deep(.p-lazy-img .img-container) {
        @apply rounded-full;
    }

    .icon-wrapper {
        @apply rounded-full text-white;

        &.avatar-sm, &.avatar-md {
            padding: 4px;
        }

        &.avatar-xl {
            padding: 8px;
        }
    }
}
</style>
