<script lang="ts" setup>

import {
    PLabel, PLazyImg,
} from '@spaceone/design-system';

import DashboardCreateScopeForm from '@/services/dashboards/components/DashboardCreateScopeForm.vue';
import type { DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';
import type { ProjectTreeNodeData } from '@/services/project/types/project-tree-type';


// interface ProviderBoardSet {
//     value: string;
//     title: string;
// }
interface Props {
    selectedTemplate: DashboardModel;
}

const props = withDefaults(defineProps<Props>(), {
    selectedTemplate: undefined,
});

const emit = defineEmits<{(e: 'select-project', value: ProjectTreeNodeData): void}>();
//
// const storeState = reactive({
//     isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
//     providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
// });
// const state = reactive({
//     // TODO: temp data
//     providerBoardSets: computed<ProviderBoardSet[]>(() => ([
//         {
//             value: 'aws',
//             title: storeState.providers.aws?.label ?? 'AWS',
//         },
//         {
//             value: 'google_cloud',
//             title: storeState.providers.google_cloud?.label ?? 'Google Cloud',
//         },
//         {
//             value: 'azure',
//             title: storeState.providers.azure?.label ?? 'Azure',
//         },
//     ])),
//     selectedProviderId: undefined as undefined|string,
// });

const handleSelectProject = (project: ProjectTreeNodeData) => {
    emit('select-project', project);
};
</script>

<template>
    <div class="dashboard-create-step2">
        <div class="selected-ootb-wrapper">
            <p-lazy-img :src="props.selectedTemplate?.description?.icon ?? 'ic_dashboard-template_blank'"
                        width="3.5rem"
                        height="3.5rem"
            />
            <div class="description-wrapper">
                <p class="description-title">
                    {{ props.selectedTemplate.name }}
                </p>
                <div class="label-wrapper">
                    <p-label v-for="(label, idx) in props.selectedTemplate.labels"
                             :key="`${label}-${idx}`"
                             :text="label"
                    />
                </div>
            </div>
        </div>
        <!--        <div class="selected-ootb-wrapper">-->
        <!--            <p-i name="ic_dashboard-template_blank"-->
        <!--                 width="3.5rem"-->
        <!--                 height="3.5rem"-->
        <!--            />-->
        <!--            <div class="description-wrapper">-->
        <!--                <p class="description-title">-->
        <!--                    {{ $t('DASHBOARDS.CREATE.BLANK') }}-->
        <!--                </p>-->
        <!--                <p class="description-text">-->
        <!--                    {{ $t('DASHBOARDS.CREATE.BLANK_DESC') }}-->
        <!--                </p>-->
        <!--            </div>-->
        <!--        </div>-->
        <!--        <div class="provider-board-wrapper">-->
        <!--            <p-field-title class="field-title">-->
        <!--                &lt;!&ndash;TODO: set language after spec is ready&ndash;&gt;-->
        <!--                Provider-->
        <!--            </p-field-title>-->
        <!--            <p-board style-type="cards"-->
        <!--                     :style-options="{ column: 2 }"-->
        <!--                     :board-sets="state.providerBoardSets"-->
        <!--                     selectable-->
        <!--                     :selected-item="state.selectedProviderId"-->
        <!--                     @item-click="handleClickProviderItem"-->
        <!--            >-->
        <!--                <template #item-left-content="{board}">-->
        <!--                    <p-lazy-img width="2.5rem"-->
        <!--                                height="2.5rem"-->
        <!--                                :src="storeState.providers[board.value]?.icon"-->
        <!--                                class="mr-3"-->
        <!--                    />-->
        <!--                </template>-->
        <!--                <template #item-content="{board}">-->
        <!--                    {{ board.title }}-->
        <!--                </template>-->
        <!--            </p-board>-->
        <!--        </div>-->
        <dashboard-create-scope-form @set-project="handleSelectProject" />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-step2 {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}
.field-title {
    padding-bottom: 0.75rem;
}
.selected-ootb-wrapper {
    display: flex;
    gap: 1rem;
    .description-wrapper {
        display: grid;
        align-items: center;
        padding: 0.25rem 0;
        .description-title {
            @apply text-label-lg;
            font-weight: 500;
        }
    }
}
</style>
