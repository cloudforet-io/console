<template>
    <section>
        <p-pane-layout>
            <!--            song-lang-->
            <p-panel-top title="Viewers" />
            <div class="dashboard-viewers-wrapper">
                <p-radio-group direction="vertical">
                    <div>
                        <p-radio>
                            <!--                    song-lang-->
                            Public
                        </p-radio>
                        <p class="viewer-description">
                            <!--                            song-lang-->
                            Anyone who has 'view' access in this workspace
                        </p>
                    </div>
                    <div>
                        <p-radio>
                            <!--                    song-lang-->
                            Private
                        </p-radio>
                        <p class="viewer-description">
                            <!--                            song-lang-->
                            Only you
                        </p>
                    </div>
                </p-radio-group>
            </div>
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import {
    PPaneLayout, PPanelTop, PRadioGroup, PRadio,
} from '@spaceone/design-system';

export default {
    name: 'DashboardViewerForm',
    components: {
        PPanelTop,
        PPaneLayout,
        PRadioGroup,
        PRadio,
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-viewers-wrapper {
    padding: 0.5rem 1rem 2.5rem;
    .p-radio-group {
        display: grid;
        grid-gap: 0.815rem;
    }
    .viewer-description {
        @apply text-xs text-gray-500;
        font-weight: 400;
        margin: 0.25rem 0 0 1.5rem;
    }
}
</style>
