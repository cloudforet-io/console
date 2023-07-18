<script lang="ts" setup>
import { PPaneLayout, PIconButton } from '@spaceone/design-system';
import { useI18n } from 'vue-i18n';

import OverlayPageLayout from '@/common/modules/page-layouts/OverlayPageLayout.vue';

import ProjectMemberTab from '@/services/project/project-detail/project-member/modules/ProjectMemberTab.vue';

interface Props {
    visible: boolean;
    groupId: string;
    manageDisabled: boolean;
}

withDefaults(defineProps<Props>(), {
    visible: false,
    groupId: '',
    manageDisabled: false,
});
const emit = defineEmits<{(e: 'close'): void}>();
const { t } = useI18n();

const goBack = () => {
    emit('close');
};

</script>

<template>
    <overlay-page-layout :visible="visible"
                         class="project-group-member"
    >
        <p-pane-layout class="page-wrapper">
            <div class="page-navigation">
                <div class="title-wrapper">
                    <p-icon-button name="ic_arrow-left"
                                   class="mr-2"
                                   @click="goBack()"
                    />
                    <div class="title">
                        {{ t('PROJECT.LANDING.MANAGE_PROJECT_GROUP_MEMBER') }}
                    </div>
                </div>
            </div>
            <project-member-tab :is-project-group="true"
                                :project-group-id="groupId"
                                :manage-disabled="manageDisabled"
                                class="mt-8"
            />
        </p-pane-layout>
    </overlay-page-layout>
</template>

<style lang="postcss" scoped>
.project-group-member {
    @apply bg-gray-100;
    .page-wrapper {
        @apply bg-gray-100;
        width: 100%;
        border: none;
        flex-grow: 1;
        .page-navigation {
            .title-wrapper {
                display: flex;
                .title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    line-height: 1.2;
                }
            }
        }

        /* custom project-member-tab */
        :deep(.member-tab) {
            .p-toolbox-table {
                @apply border border-gray-200 rounded-md;
                border-style: solid;
                padding-bottom: 2.5rem;
            }
        }
        .project-group-pane {
            min-height: 23.5rem;
            overflow-y: auto;
            padding-left: 1rem;
            margin: 1.5rem 0;
        }
    }
}
</style>
