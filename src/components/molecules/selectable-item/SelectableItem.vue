<template>
    <div class="item-container" :class="{active: active}" v-on="$listeners">
        <slot name="side">
            <p-lazy-img :img-url="iconUrl"
                        :error-icon="defaultIcon"
                        width="2rem" height="2rem"
            />
        </slot>
        <div class="flex-grow pl-2">
            <slot name="title">
                <p class="title">
                    {{ title }}
                </p>
            </slot>
            <slot name="contents" />
        </div>
        <slot name="extra" />
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
    .item-container {
        @apply flex p-2 items-center justify-between w-full bg-white cursor-pointer;
        &:hover {
            @apply bg-gray3;
        }
        &.active {
            @apply bg-blue-200 text-secondary border border-secondary;
            &:hover {
                @apply bg-gray3;
            }
        }
        /* TODO: disabled item style */
    }
.title {
    @apply text-sm;
    color: inherit;
}
</style>
