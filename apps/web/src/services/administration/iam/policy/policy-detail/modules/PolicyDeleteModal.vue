<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PLink, PDataTable } from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';


import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

interface Props {
    visible: boolean;
    policyId: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    policyId: '',
});
const emit = defineEmits(['update:visible']);
const { t } = useI18n();
const router = useRouter();

const state = reactive({
    loading: true,
    proxyVisible: useProxyValue('visible', props, emit),
    fields: [
        { name: 'name', label: 'Name' },
        { name: 'tags.description', label: 'Description' },
        { name: 'role_type', label: 'Type' },
    ],
    attachedRoles: [],
});

const deletePolicy = async () => {
    try {
        state.loading = true;
        await SpaceConnector.client.identity.policy.delete({
            policy_id: props.policyId,
        });
        showSuccessMessage(t('IAM.POLICY.MODAL.ALT_S_DELETE_POLICY'), '');
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, t('IAM.POLICY.MODAL.ALT_S_DELETE_POLICY'));
    } finally {
        state.loading = false;
    }
};

const handleConfirm = () => {
    deletePolicy();
    state.proxyVisible = false;
    router.go(-1);
};

const listRoles = async () => {
    try {
        const roleList = await SpaceConnector.client.identity.role.list({
            policy_id: props.policyId,
        });
        const { results } = roleList;
        state.attachedRoles = results;
    } catch (e) {
        state.attachedRoles = [];
        ErrorHandler.handleError(e);
    }
};

(async () => {
    await listRoles();
})();

</script>

<template>
    <delete-modal
        v-model:visible="state.proxyVisible"
        :header-title="state.attachedRoles.length ? t('IAM.POLICY.MODAL.DELETE_CANNOT_POLICY') : t('IAM.POLICY.MODAL.DELETE_POLICY')"
        :hide-footer="!!state.attachedRoles.length"
        class="policy-delete-modal"
        :size="state.attachedRoles.length ? 'md' : 'sm'"
        @confirm="handleConfirm"
    >
        <template v-if="state.attachedRoles.length"
                  #delete-modal-body
        >
            <div class="modal-delete-disabled-title">
                <span>{{ t('IAM.POLICY.MODAL.DELETE_HELP_TEXT') }} </span>
                <p-link
                    :action-icon="ACTION_ICON.INTERNAL_LINK"
                    new-tab
                    :to="{ name: ADMINISTRATION_ROUTE.IAM.ROLE._NAME }"
                    highlight
                >
                    {{ t('IAM.POLICY.MODAL.DELETE_FOLLOW_ROLES') }}
                </p-link>
            </div>
            <p-data-table :fields="state.fields"
                          :items="state.attachedRoles"
            />
        </template>
    </delete-modal>
</template>

<style lang="postcss" scoped>
.policy-delete-modal {
    .modal-delete-disabled-title {
        @apply inline-flex items-center;
        vertical-align: middle;
        & > span {
            margin-right: 0.25rem;
        }
    }
    .p-data-table {
        margin-top: 1rem;
    }
}
</style>
