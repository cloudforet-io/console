<script lang="ts" setup>
import {
    PI,
} from '@cloudforet/mirinae';


interface Props {
    isCollapsed?: boolean;
    fieldTitle?: string;
}
const props = withDefaults(defineProps<Props>(), {
    isCollapsed: false,
    fieldTitle: undefined,
});
const emit = defineEmits<{(e: 'update:isCollapsed', isCollapsed?: boolean): void; }>();

/* Event */
const handleClickTitle = () => {
    emit('update:isCollapsed', !props.isCollapsed);
};
</script>

<template>
    <div class="dashboard-folder-tree-title"
         :class="{ 'is-collapsed': props.isCollapsed }"
         @click="handleClickTitle"
    >
        <p-i name="ic_chevron-down"
             width="1.25rem"
             height="1.25rem"
             color="inherit transparent"
             class="arrow-button"
        />
        <span class="tree-title">{{ props.fieldTitle }}</span>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-folder-tree-title {
    @apply rounded-md;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
    margin-bottom: 0.25rem;
    padding: 0.25rem 0.75rem 0.25rem 0.25rem;
    .arrow-button {
        transition: transform 0.3s ease-in-out;
    }
    .tree-title {
        @apply text-label-lg;
        font-weight: 500;
    }
    &.is-collapsed {
        .arrow-button {
            transform: rotate(-90deg);
        }
    }
    &:hover {
        @apply bg-gray-150;
    }
}
</style>
