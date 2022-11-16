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
                            <!--                            FIXME:: waiting for NEW card component-->
                            <p-select-card
                                v-for="(item, idx) in defaultTemplateMock"
                                :key="`default-template-${idx}`"
                                :selected="selectedTemplate === item.name"
                                :tab-index="idx"
                                @click="() => handleSelectTemplate(item.name)"
                            >
                                <template #bottom>
                                    <div class="default-template-card">
                                        <p-i :name="item.icon"
                                             width="2.25rem"
                                             height="2.25rem"
                                        />
                                        <span>{{ item.label }}</span>
                                        <p-field-title v-for="(labelItem, labelIdx) in item.tags"
                                                       :key="`default-template-label-${idx}-${labelIdx}`"
                                        >
                                            {{ labelItem }}
                                        </p-field-title>
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
                            <!--                            FIXME:: waiting for NEW card component-->
                            <p-select-card
                                v-for="(item, idx) in customTemplateMock"
                                :key="`custom-template-${idx}`"
                                :selected="selectedTemplate === item.name"
                                :tab-index="idx"
                                @click="() => handleSelectTemplate(item.name)"
                            >
                                <template #bottom>
                                    <div class="custom-template-card">
                                        <p-i :name="item.icon"
                                             width="2.25rem"
                                             height="2.25rem"
                                        />
                                        <span>{{ item.label }}</span>
                                        <p-field-title v-for="(labelItem, labelIdx) in item.tags"
                                                       :key="`custom-template-label-${idx}-${labelIdx}`"
                                        >
                                            {{ labelItem }}
                                        </p-field-title>
                                    </div>
                                </template>
                            </p-select-card>
                        </div>
                    </div>
                </div>
            </div>
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import { reactive, toRefs } from 'vue';

import {
    PPaneLayout, PPanelTop, PSelectCard, PI, PFieldTitle,
} from '@spaceone/design-system';

export default {
    name: 'DashboardTemplateForm',
    components: {
        PPanelTop,
        PPaneLayout,
        PSelectCard,
        PI,
        PFieldTitle,
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            selectedTemplate: '',
        });

        const defaultTemplateMock: Array<any> = [
            {
                label: 'Monthly Cost Summary',
                name: 'monthly_cost_summary',
                icon: 'ic_edit',
                tags: [
                    'Cost', 'AWS', 'Azure',
                ],
            },
            {
                label: 'Cloud Asset Overview',
                name: 'cloud_asset_overview',
                icon: 'ic_delete',
                tags: [
                    'Resources', 'AWS', 'Google Cloud Platform',
                ],
            },
        ];

        const customTemplateMock: Array<any> = [
            {
                label: 'Dashboard 1',
                name: 'dashboard_1',
                icon: '',
                tags: [
                    'Cost', 'AWS', 'Azure',
                ],
            },
            {
                label: 'Wonny\'s Dashboard',
                name: 'wonnys_dashboard',
                icon: 'ic_delete',
                tags: [
                    'Resources', 'AWS', 'Google Cloud Platform',
                ],
            },
        ];

        const handleSelectTemplate = (templateName: string) => {
            state.selectedTemplate = templateName;
            emit('set-template', templateName);
        };

        return {
            ...toRefs(state),
            defaultTemplateMock,
            customTemplateMock,
            handleSelectTemplate,
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
