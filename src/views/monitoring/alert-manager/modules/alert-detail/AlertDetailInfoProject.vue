<template>
    <p v-if="!isEditMode" class="content-wrapper">
        <span class="project">
            <p-anchor :to="referenceRouter(
                          alertData.project_id,
                          { resource_type: 'identity.Project' })"
                      highlight
            >
                {{ projects[alertData.project_id] ? projects[alertData.project_id].label : alertData.project_id }}
            </p-anchor>
        </span>
    </p>
    <div v-else class="content-wrapper" />
</template>

<script lang="ts">
import { PTextarea, PButton, PI } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { useAlertDetailItem } from '@/views/monitoring/alert-manager/modules/alert-detail/hooks';
import { EDIT_MODE } from '@/views/monitoring/alert-manager/lib/config';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';

export default {
    name: 'AlertDetailInfoProject',
    components: {
        PTextarea,
        PButton,
        PI,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
        alertData: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const {
            state: alertDetailItemState,
            cancelEdit,
            startEdit,
            updateAlert,
            onClickSave,
        } = useAlertDetailItem({
            alertId: props.id,
            isEditMode: false,
            dataForUpdate: props.alertData?.project_id,
        });

        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
        });

        return {
            EDIT_MODE,
            ...toRefs(alertDetailItemState),
            ...toRefs(state),
            referenceRouter,
            cancelEdit,
            startEdit,
            updateAlert,
            onClickSave,
        };
    },
};
</script>

<style lang="postcss" scoped>
@import './styles/alertDetailItem.pcss';
</style>
