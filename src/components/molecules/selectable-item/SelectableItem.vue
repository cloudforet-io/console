<template>
    <div class="item-container" :class="{
        active: active,
        [theme]: true,
        skeleton: loading
    }" v-on="$listeners"
    >
        <div v-if="loading" class="contents">
            <div class="avatar" />
            <div class="grid grid-cols-1 gap-1 w-full">
                <div class="line" />
                <div class="line" />
            </div>
        </div>
        <template v-else>
            <slot name="bar" :color="color">
                <div v-if="color" class="bar" :style="{color}" />
            </slot>
            <div class="contents">
                <slot name="side">
                    <p-lazy-img :img-url="iconUrl"
                                :error-icon="defaultIcon"
                                width="2rem" height="2rem"
                    />
                </slot>
                <div class="flex-grow pl-2">
                    <slot name="contents" :color="color">
                        <slot name="title">
                            <p class="title">
                                {{ title }}
                            </p>
                        </slot>
                        <slot name="contents-bottom" />
                    </slot>
                </div>
                <slot name="extra" :color="color" />
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from '@vue/composition-api';
import { selectableItemProps, SelectableItemPropsType } from '@/components/molecules/selectable-item/SelectableItem.toolset';
import PLazyImg from '@/components/organisms/lazy-img/LazyImg.vue';

import PI from '@/components/atoms/icons/PI.vue';

export default defineComponent({
    name: 'SelectableItem',
    components: { PI, PLazyImg },
    props: selectableItemProps,
    setup(props: SelectableItemPropsType) {
        return {
        };
    },
});
</script>

<style lang="postcss" scoped>
@define-mixin skeleton $base-color, $shine-color, $total-width, $offset {
    @keyframes shine {
        from {
            background-position: -$offset;
        }
        to {
            background-position: calc($(total-width) - $(offset));
        }
    }
    background-image: linear-gradient(90deg, $(base-color) 0, $(shine-color) 40px, $(base-color) 80px);
    background-size: $total-width;
    background-repeat: repeat;
    animation: shine 1.5s infinite linear;
}

@define-mixin item-theme $border-color, $hover-bg-color, $active-color, $active-bg-color {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    border-color: $border-color;
    background-color: theme('colors.white');
    cursor: pointer;
    border-width: 1px;
    min-height: 3rem;
    height: 100%;
    .bar {
        position: absolute;
        left: 0;
        top: 0;
        border-radius: 2px 0 0 2px;
        width: 4px;
        height: 100%;
        background-color: currentColor;
    }
    .contents {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
    }
    &:hover {
        background-color: $hover-bg-color;
    }
    &.active {
        background-color: $active-bg-color;
        color: $active-color;
        border-color: $active-color;
        &:hover {
            background-color: $hover-bg-color;
        }
    }

    &.skeleton {
            border-color: transparent;
        .avatar {
            @apply rounded-sm h-8 w-8 mr-4;

            @mixin skeleton theme('colors.primary3'), theme('colors.gray.100'), 11rem, 0;
        }
        .line {
            @apply rounded-sm h-3 w-24;

            @mixin skeleton theme('colors.primary3'), theme('colors.gray.100'), 11rem, 3rem;
            &:last-child {
                @apply opacity-50 w-32;
            }
        }
        &:hover {
            background-color: theme('colors.white');
            cursor: unset;
        }
    }

    .title {
        @apply text-sm;
        color: inherit;
    }
}
.item-container {
    &.default {
        @mixin item-theme transparent, theme('colors.gray.100'), theme('colors.secondary'), theme('colors.blue.200');
    }
    &.card {
        @mixin item-theme theme('colors.gray.200'), theme('colors.blue.200'), theme('colors.secondary'), theme('colors.blue.200');
        border-radius: 2px;
        .contents {
            padding: 0.5rem 1rem;
        }
    }
}

</style>
