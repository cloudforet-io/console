<template>
    <p-badge class="p-tag" :class="{deletable: deletable}"
             :style-type="styleType" shape="square" :outline="outline"
             v-on="$listeners"
    >
        <slot />
        <p-i v-if="deletable" name="ic_delete" width="1rem"
             height="1rem" class="icon"
             color="transparent inherit"
             @click="$emit('delete')"
        />
    </p-badge>
</template>

<script lang="ts">
import PBadge from '@/data-display/badges/PBadge.vue';
import PI from '@/foundation/icons/PI.vue';

export default {
    name: 'PTag',
    components: {
        PBadge,
        PI,
    },
    props: {
        deletable: {
            type: Boolean,
            default: true,
        },
        styleType: {
            type: String,
            default: 'gray200',
        },
        outline: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        return { };
    },
};
</script>

<style lang="postcss">
.p-tag {
    margin-right: 0.5rem;
    vertical-align: middle;
    white-space: nowrap;
    color: inherit;
    &.deletable {
        padding-right: 0.15rem;
        .icon {
            @apply text-gray-400 ml-2;
            cursor: pointer;
        }
        &:hover {
            @apply bg-gray-100;
            .icon {
                @apply text-alert;
            }
        }
    }
}
</style>
