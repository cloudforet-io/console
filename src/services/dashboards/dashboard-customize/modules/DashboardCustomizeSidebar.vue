<template>
    <div>
        <portal to="info-title">
            <!--song-lang-->
            <span class="sidebar-title">Customize Dashboard</span> <br>
        </portal>
        <portal to="info-contents">
            <div class="sidebar-contents">
                <div class="selector-wrapper">
                    <p-toggle-button :value="enableDateRange"
                                     sync
                    />
                    <!--song-lang-->
                    <span>Date range Selector</span>
                </div>
                <div class="selector-wrapper">
                    <p-toggle-button :value="enableCurrency"
                                     sync
                    />
                    <!--song-lang-->
                    <span>Currency Selector</span>
                </div>
                <p-divider class="divider" />
                <p-button style-type="tertiary"
                          size="lg"
                          icon-left="ic_plus_bold"
                          block
                          class="add-button"
                          @click="handleClickAddWidget"
                >
                    <!--song-lang-->
                    Add Widget
                </p-button>
                <draggable class="draggable-wrapper"
                           ghost-class="ghost"
                           :list="sampleWidgets"
                >
                    <div v-for="(widget, idx) in sampleWidgets"
                         :key="`drag-item-${widget.name}-${idx}`"
                         class="draggable-item"
                    >
                        <p-i name="ic_drag-handle--slim"
                             width="1rem"
                             height="1rem"
                        />
                        <span class="text">{{ widget.label }}</span>
                    </div>
                </draggable>
            </div>
        </portal>
    </div>
</template>

<script lang="ts">
import {
    onMounted,
    onUnmounted, reactive, toRefs,
} from 'vue';
import draggable from 'vuedraggable';

import {
    PButton, PDivider, PI, PToggleButton,
} from '@spaceone/design-system';

import { store } from '@/store';

export default {
    name: 'DashboardCustomizeSidebar',
    components: {
        PI,
        PButton,
        PDivider,
        PToggleButton,
        draggable,
    },
    props: {},
    setup() {
        const state = reactive({
            customizeModalVisible: false,
            enableDateRange: true,
            enableCurrency: true,
            sampleWidgets: [ // TODO: sample data
                { name: 'widget1', label: 'Monthly Cost' },
                { name: 'widget2', label: 'Budget Usage Summary' },
                { name: 'widget3', label: 'Budget Usage' },
                { name: 'widget4', label: 'Cost by Project' },
                { name: 'widget5', label: 'Budget Status' },
                { name: 'widget6', label: 'Cost Trend by Provider Cost Trend by Provider' },
                { name: 'widget7', label: 'Month-to-Date Spend' },
            ],
        });

        /* Event */
        const handleClickAddWidget = () => {
            console.log('add widget!'); // TODO: to be deleted
        };

        onMounted(() => {
            store.dispatch('display/showInfo');
        });
        onUnmounted(() => {
            store.dispatch('display/hideSidebar');
        });

        return {
            ...toRefs(state),
            handleClickAddWidget,
        };
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
    gap: 1.5625rem;
    font-size: 0.875rem;
    line-height: 125%;

    .selector-wrapper {
        display: flex;
        gap: 0.5rem;
        &:first-child {
            padding-bottom: 0.5rem;
        }
    }
    .divider {
        margin: 1.5rem 0;
    }
    .add-button {
        margin-bottom: 1rem;
    }
    .draggable-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        .draggable-item {
            @apply border border-gray-200 rounded bg-white;
            display: flex;
            gap: 0.5rem;
            cursor: grab;
            padding: 0.5rem;
            &:active {
                cursor: grabbing;
            }
            .text {
                @apply truncate;
            }
        }
        .ghost {
            @apply bg-blue-200;
        }
    }
}
</style>
