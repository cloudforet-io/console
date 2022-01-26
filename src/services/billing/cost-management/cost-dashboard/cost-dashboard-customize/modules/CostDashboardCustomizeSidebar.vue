<template>
    <fragment>
        <portal to="info-title">
            <span class="sidebar-title">Customize Dashboard</span> <br>
        </portal>
        <portal to="info-contents">
            <p class="sidebar-contents">
                <span class="sidebar-desc">You can add, move and <br> remove your widgets.</span>
                <p-icon-text-button style-type="primary-dark" name="ic_plus_bold" :outline="true"
                                    class="add-widget-button"
                >
                    Add Widget
                </p-icon-text-button>
                <span class="widget-count">Widget</span>
            </p>
        </portal>
    </fragment>
</template>

<script lang="ts">
import { PIconTextButton } from '@spaceone/design-system';
import { onUnmounted } from '@vue/composition-api';
import { store } from '@/store';

export default {
    name: 'CostDashboardCustomizeSidebar',
    components: {
        PIconTextButton,
    },

    setup() {
        onUnmounted(() => {
            store.dispatch('display/hideSidebar');
        });
        return {};
    },
};
</script>

<style lang="postcss" scoped>
.sidebar-title {
    margin-bottom: 0.75rem;
    font-size: 1.125rem;
    line-height: 125%;
}

.sidebar-contents {
    @apply flex flex-col;
    gap: 1.5625rem;
    font-size: 0.875rem;
    line-height: 125%;
    .sidebar-desc {
        @apply text-gray-600;
    }
    .add-widget-button {
        display: block;
    }
    .widget-count {
        @apply font-bold;
    }
}
</style>
