<template>
    <router-link v-if="show" class="gnb-sub-menu" :to="to">
        <div class="contents">
            <span>{{ label }}</span>
            <beta-mark v-if="isBeta" />
            <new-mark v-if="isNew" />
        </div>
    </router-link>
</template>

<script lang="ts">
import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';

export default {
    name: 'GNBSubMenu',
    components: { NewMark, BetaMark },
    props: {
        show: {
            type: Boolean,
            default: true,
        },
        to: {
            type: Object,
            default: () => ({}),
        },
        label: {
            type: String,
            default: '',
        },
        isBeta: {
            type: Boolean,
            default: false,
        },
        isNew: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style lang="postcss" scoped>
.gnb-sub-menu {
    .contents {
        @apply text-gray-900 rounded;
        position: relative;
        width: 100%;
        height: 2rem;
        font-size: 0.875rem;
        line-height: 1rem;
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;
        padding: 0.5rem;
        &:hover, &:focus {
            @apply bg-primary4 text-primary;
        }
        &:active {
            @apply bg-white;
        }
    }
}
</style>
