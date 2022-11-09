<template>
    <section>
        <p-pane-layout>
            <!--            song-lang-->
            <p-panel-top title="Start From" />
            <div class="dashboard-template-wrapper">
                <div class="dashboard-template-container">
                    <div class="card-container">
                        <span class="card-wrapper-title">
                            <!--                        song-lang-->
                            Default Template
                        </span>
                        <div class="card-wrapper">
                            <p-select-card
                                v-for="(item, idx) in defaultTemplateData"
                                :key="`default-template-${idx}`"
                                :tabindex="idx"
                            >
                                <template #bottom>
                                    <div class="default-template-card">
                                        <p-i :name="item.icon"
                                             width="2.25rem"
                                             height="2.25rem"
                                        />
                                        <span>{{ item.name }}</span>
                                        <p-label v-for="(labelItem, labelIdx) in item.tags"
                                                 :key="`template-label-${idx}-${labelIdx}`"
                                        >
                                            {{ labelItem }}
                                        </p-label>
                                    </div>
                                </template>
                            </p-select-card>
                        </div>
                    </div>
                    <div class="card-container">
                        <span class="card-wrapper-title">
                            <!--                        song-lang-->
                            Existing Dashboard
                        </span>
                        <div class="card-wrapper">
                            <p-select-card
                                v-for="(item, idx) in [0]"
                                :key="`existing-dashboard-${idx}`"
                                :tabindex="idx"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import {
    PPaneLayout, PPanelTop, PSelectCard, PI, PLabel,
} from '@spaceone/design-system';

export default {
    name: 'DashboardTemplateForm',
    components: {
        PPanelTop,
        PPaneLayout,
        PSelectCard,
        PI,
        PLabel,
    },
    setup() {
        const defaultTemplateData = [
            {
                name: 'Monthly Cost Summary',
                icon: 'ic_edit',
                tags: [
                    'Cost', 'AWS', 'Azure',
                ],
            },
            {
                name: 'Cloud Asset Overview',
                icon: 'ic_delete',
                tags: [
                    'Resources', 'AWS', 'Google Cloud Platform',
                ],
            },
        ];

        return {
            defaultTemplateData,
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-template-wrapper {
    padding: 0.5rem 1rem 2.375rem 1rem;
    .dashboard-template-container {
        @apply bg-gray-100 border-gray-200;
        padding: 1rem 1rem 1.25rem;
        border-width: 1px;
        border-radius: 0.5rem;
        display: grid;
        grid-gap: 1rem;
        .card-wrapper-title {
            @apply text-gray-500 !important text-xs;
            font-weight: 700;
            margin-bottom: 0.5rem;
            display: block;
        }
        .card-wrapper {
            display: grid;
            grid-gap: 0.5rem;
            grid-template-columns: 50% 50%;
        }
    }
}
</style>
