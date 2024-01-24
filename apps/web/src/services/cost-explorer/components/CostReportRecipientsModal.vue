<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';

import {
    PButtonModal, PSelectDropdown, PCheckbox, PFieldGroup, PTextInput, PTextButton, PIconButton,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { debounce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import EnvelopeImage from '@/assets/images/img_envelope-filled.svg';
import DomainAdminImage from '@/assets/images/role/img_avatar_admin.png';
import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';
import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { emailValidator } from '@/lib/helper/user-validation-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';


interface RecipientItem {
    name: string;
    label: string;
    icon: string;
    enabled: boolean;
    menuItems: MenuItem[];
    selectedItems?: string[];
}
interface Props {
    visible: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    recipientsItems: computed<RecipientItem[]>(() => ([
        {
            name: 'admin',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ADMIN_ROLE') as string,
            icon: DomainAdminImage,
            enabled: formState.enableAdminRole,
            menuItems: state.roleList.filter((role) => role.role_type === ROLE_TYPE.DOMAIN_ADMIN).map((role) => ({
                label: role.name,
                name: role.role_id,
            })),
            selectedItems: formState.selectedAdminRole,
        },
        {
            name: 'workspaceOwner',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.WORKSPACE_OWNER') as string,
            icon: WorkspaceOwnerImage,
            enabled: formState.enableWorkspaceOwner,
            menuItems: state.roleList.filter((role) => role.role_type === ROLE_TYPE.WORKSPACE_OWNER).map((role) => ({
                label: role.name,
                name: role.role_id,
            })),
            selectedItems: formState.selectedWorkspaceOwner,
        },
        {
            name: 'additionalRecipients',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ADDITIONAL_RECIPIENTS') as string,
            icon: EnvelopeImage,
            enabled: formState.enableAdditionalRecipients,
            menuItems: [
                { name: 'all', label: 'All' },
            ],
        },
    ])),
    roleList: [] as RoleModel[],
});
const formState = reactive({
    enableAdminRole: false,
    enableWorkspaceOwner: false,
    enableAdditionalRecipients: false,
    selectedAdminRole: [] as string[],
    selectedWorkspaceOwner: [] as string[],
    additionalRecipients: [] as string[],
});

/* Util */
const getInvalidText = (value?: string): string => {
    if (!value) return '';
    console.log(value, emailValidator(value));
    if (emailValidator(value)) return i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.EMAIL_INVALID') as string;
    // TODO: check if email is already registered
    return '';
};

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchRole = async () => {
    apiQueryHelper.setFilters([{
        k: 'role_type',
        v: [ROLE_TYPE.DOMAIN_ADMIN, ROLE_TYPE.WORKSPACE_OWNER],
        o: '',
    }]);
    try {
        const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
            query: apiQueryHelper.data,
        });
        state.roleList = results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.roleList = [];
    }
};

/* Event */
const handleConfirm = () => {
    // TODO
    showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALT_S_UPDATE_RECIPIENTS'), '');
    state.proxyVisible = false;
};
const handleToggleRecipients = (name: string) => {
    if (name === 'admin') {
        formState.enableAdminRole = !formState.enableAdminRole;
    } else if (name === 'workspaceOwner') {
        formState.enableWorkspaceOwner = !formState.enableWorkspaceOwner;
    } else if (name === 'additionalRecipients') {
        formState.enableAdditionalRecipients = !formState.enableAdditionalRecipients;
    }
};
const handleClickAddEmail = () => {
    formState.additionalRecipients.push('');
};
const handleInputAdditionalRecipient = debounce((idx: number, value: string) => {
    formState.additionalRecipients[idx] = value;
    formState.additionalRecipients = [...formState.additionalRecipients];
}, 300);
const handleDeleteAdditionalRecipient = (idx: number) => {
    formState.additionalRecipients.splice(idx, 1);
    formState.additionalRecipients = [...formState.additionalRecipients];
};

onMounted(() => {
    fetchRole();
});
</script>

<template>
    <p-button-modal :visible.sync="state.proxyVisible"
                    :header-title="$t('BILLING.COST_MANAGEMENT.COST_REPORT.REPORT_RECIPIENTS')"
                    size="sm"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <div v-for="item in state.recipientsItems"
                     :key="`recipient-modal-item-${item.name}`"
                     class="recipient-list-item"
                     :class="{ 'selected': item.enabled, 'additional-recipients': item.name === 'additionalRecipients' }"
                >
                    <div class="left-part"
                         @click="handleToggleRecipients(item.name)"
                    >
                        <p-checkbox :value="true"
                                    :selected="item.enabled"
                                    @click="handleToggleRecipients(item.name)"
                        />
                        <img :src="item.icon"
                             alt="icon"
                             class="icon"
                        >
                        <span>{{ item.label }}</span>
                    </div>
                    <template v-if="item.enabled">
                        <p-select-dropdown v-if="item.name === 'admin'"
                                           class="right-part"
                                           use-fixed-menu-style
                                           style-type="transparent"
                                           :menu="item.menuItems"
                                           :selected.sync="formState.selectedAdminRole"
                                           appearance-type="badge"
                                           show-select-marker
                                           multi-selectable
                                           selection-highlight
                                           is-filterable
                        />
                        <p-select-dropdown v-else-if="item.name === 'workspaceOwner'"
                                           class="right-part"
                                           use-fixed-menu-style
                                           style-type="transparent"
                                           :menu="item.menuItems"
                                           :selected.sync="formState.selectedWorkspaceOwner"
                                           appearance-type="badge"
                                           show-select-marker
                                           multi-selectable
                                           selection-highlight
                                           is-filterable
                        />
                    </template>
                    <template v-if="item.enabled && item.name === 'additionalRecipients'">
                        <div v-for="(additionalRecipient, idx) in formState.additionalRecipients"
                             :key="`additional-recipient-${idx}`"
                             class="additional-recipient-item"
                        >
                            <p-field-group :invalid="!!getInvalidText(additionalRecipient)"
                                           :invalid-text="getInvalidText(additionalRecipient)"
                                           required
                            >
                                <template #default="{invalid}">
                                    <p-text-input :value="additionalRecipient"
                                                  :invalid="invalid"
                                                  use-fixed-menu-style
                                                  @update:value="handleInputAdditionalRecipient(idx, ...arguments)"
                                    />
                                </template>
                            </p-field-group>
                            <p-icon-button name="ic_delete"
                                           style-type="negative-transparent"
                                           @click="handleDeleteAdditionalRecipient(idx)"
                            />
                        </div>
                        <p-text-button
                            class="add-email-button"
                            highlight
                            style-type="highlight"
                            icon-left="ic_plus_thin"
                            @click="handleClickAddEmail"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.ADD_EMAIL') }}
                        </p-text-button>
                    </template>
                </div>
            </div>
        </template>
        <template #confirm-button>
            <span>{{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.SAVE') }}</span>
        </template>
    </p-button-modal>
</template>

<style lang="scss" scoped>
.modal-content-wrapper {
    display: grid;
    gap: 0.5rem;
    padding-bottom: 2rem;
}
.recipient-list-item {
    @apply border rounded-md border-gray-200 text-label-md;
    height: 2.5rem;
    display: flex;
    justify-content: space-between;
    gap: 0.25rem;
    cursor: pointer;
    align-items: center;
    padding: 0.5rem 0.75rem;
    &.selected {
        @apply bg-secondary-2;
    }
    &.additional-recipients {
        display: block;
        height: auto;
        min-height: 2.5rem;
    }
    .left-part {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        .icon {
            @apply rounded-full;
            width: 1.25rem;
            height: 1.25rem;
        }
    }
    .right-part {
        width: auto;
    }
}

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .selected-item-text {
        @apply truncate;
        display: inline-block;
        max-width: 8rem;
    }
    .selected-item {
        display: flex;
        align-items: center;
    }
}
.additional-recipient-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: space-between;
    padding-top: 0.5rem;
    .p-field-group {
        margin-bottom: 0;
    }
}
.add-email-button {
    display: block;
    width: 100%;
    margin-top: 0.75rem;
}
</style>
