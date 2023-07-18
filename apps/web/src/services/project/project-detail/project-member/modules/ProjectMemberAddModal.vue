<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PBoxTab, PFilterableDropdown, PTooltip, PI, PTextInput,
} from '@spaceone/design-system';
import type { FilterableDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';
import type { InputItem } from '@spaceone/design-system/types/inputs/input/text-input/type';
import { debounce, union } from 'lodash';
import {
    reactive, computed, watch, ref,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import type { RawPagePermission } from '@/lib/access-control/config';
import { PAGE_PERMISSION_TYPE } from '@/lib/access-control/config';
import { getPagePermissionMapFromRaw } from '@/lib/access-control/page-permission-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { checkEmailFormat } from '@/services/administration/iam/user/lib/user-form-validations';
import type { MemberItem } from '@/services/project/project-detail/project-member/type';
import { AUTH_TYPE } from '@/services/project/project-detail/project-member/type';

type ExternalItemErrorCode = 'DUPLICATED'|'EMAIL_FORMAT'|'ALREADY_EXIST'|'NOT_FOUND';
interface ExternalItemsError {
    all?: ExternalItemErrorCode;
    [selectedIndex: number]: ExternalItemErrorCode
}
interface RoleMenuItem extends FilterableDropdownMenuItem {
    pagePermissions: RawPagePermission[]
}

interface Props {
    visible: boolean;
    isProjectGroup: boolean;
    projectId?: string;
    projectGroupId?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();
const store = useStore();
const { t } = useI18n();

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    authType: computed(() => store.state.domain.extendedAuthType),
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
    members: [] as MemberItem[],
    //
    tabs: computed(() => {
        const tabs = [
            {
                name: AUTH_TYPE.INTERNAL_USER,
                label: t('PROJECT.DETAIL.MEMBER.ADD_FROM', { user_type: t('PROJECT.DETAIL.MEMBER.INTERNAL_USER') }),
            },
        ];
        if (state.authType === AUTH_TYPE.KEYCLOAK) {
            tabs.push({
                name: AUTH_TYPE.KEYCLOAK,
                label: t('PROJECT.DETAIL.MEMBER.ADD_FROM', { user_type: t('PROJECT.DETAIL.MEMBER.KEYCLOAK') }),
            });
        }
        return tabs;
    }),
    activeTab: AUTH_TYPE.INTERNAL_USER,
    roleItems: [] as RoleMenuItem[],
    internalUserItems: [] as FilterableDropdownMenuItem[],
    externalUserItems: [] as InputItem[],
    invalidUserList: [] as string[],
    existingMemberList: [] as string[],
    searchText: '',
    labelText: '',
    showRoleWarning: false,
});
const isLabelDuplicated = ref<boolean>(false);
const externalItemsErrors = ref<ExternalItemsError>({});
const externalItemsInvalidTexts = computed(() => {
    const errorCodes = union(Object.values(externalItemsErrors.value)).filter((code) => !!code);
    return errorCodes.map((code) => {
        if (code === 'DUPLICATED') return t('PROJECT.DETAIL.MEMBER.DUPLICATED_VALUE');
        if (code === 'EMAIL_FORMAT') return t('IDENTITY.USER.FORM.EMAIL_INVALID');
        if (code === 'ALREADY_EXIST') return t('PROJECT.DETAIL.MEMBER.ALREADY_EXISTING');
        if (code === 'NOT_FOUND') return t('PROJECT.DETAIL.MEMBER.INVALID');
        return undefined;
    });
});
const selectedExternalUserItems = ref<InputItem[]>([]);
const {
    forms: {
        labels, selectedRoleItems, selectedInternalUserItems,
    },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
} = useFormValidator({
    labels: [] as InputItem[],
    selectedRoleItems: [] as RoleMenuItem[],
    selectedInternalUserItems: [] as FilterableDropdownMenuItem[],
}, {
    selectedInternalUserItems: (val: FilterableDropdownMenuItem[]) => {
        if (!val.length) return t('PROJECT.DETAIL.MEMBER.MODAL_VALIDATION_REQUIRED');
        return true;
    },
    selectedRoleItems: (val: RoleMenuItem[]) => {
        if (!val.length) return t('PROJECT.DETAIL.MEMBER.MODAL_VALIDATION_REQUIRED');
        return true;
    },
    labels: (val: InputItem[]) => {
        if (val.length > 5) return t('PROJECT.DETAIL.MEMBER.LABEL_HELP_TEXT');
        return true;
    },
});

/* Util */
const _setInternalMenuItems = () => {
    state.internalUserItems = [];
    const memberIdList: string[] = state.members.map((d) => d.resource_id);
    Object.keys(state.users).forEach((userId) => {
        const userName = state.users[userId]?.name;
        const singleItem = {
            name: userId,
            label: userName ? `${userId} (${userName})` : userId,
            disabled: false,
        };
        if (memberIdList.includes(userId)) {
            singleItem.disabled = true;
        }
        state.internalUserItems.push(singleItem);
    });
};
const _getExternalMenuItems = (users: {user_id: string; name: string;}[]): InputItem[] => {
    const externalUserItems: InputItem[] = [];
    const memberIdList = state.members.map((d) => d.resource_id);
    users.forEach((user) => {
        const singleItem = {
            name: user.user_id,
            label: user.name ? `${user.user_id} (${user.name})` : user.user_id,
            disabled: false,
        };
        if (memberIdList.includes(user.user_id)) {
            singleItem.disabled = true;
        }
        externalUserItems.push(singleItem);
    });
    return externalUserItems;
};
const findExternalUser = async (userId: string): Promise<boolean> => {
    try {
        const res = await SpaceConnector.client.identity.user.find({ search: { user_id: userId } });
        return res.results.length;
    } catch (e) {
        return false;
    }
};
const setExternalItemsInvalidTexts = async (userItem: InputItem): Promise<ExternalItemErrorCode|undefined> => {
    /* 1. check email validation */
    const emailFormValidation = checkEmailFormat(userItem.name ?? '');
    if (!emailFormValidation.isValid) {
        return 'EMAIL_FORMAT';
    }

    /* 2. check member list */
    const memberIdList: string[] = state.members.map((d) => d.resource_id);
    if (memberIdList.includes(userItem.name ?? '')) {
        return 'ALREADY_EXIST';
    }

    /* check if external user exist */
    const isExternalUserExist = await findExternalUser(userItem.name ?? '');
    if (!isExternalUserExist) {
        return 'NOT_FOUND';
    }

    return undefined;
};

/* Api */
const listRoles = async () => {
    const { results } = await SpaceConnector.client.identity.role.list({
        role_type: 'PROJECT',
    });
    state.roleItems = results.map((d) => ({
        type: 'item',
        label: d.name,
        name: d.role_id,
        pagePermissions: d.page_permissions,
    }));
};
const addMember = async () => {
    try {
        const params: any = {
            role_id: selectedRoleItems.value[0].name,
            users: state.activeTab === AUTH_TYPE.INTERNAL_USER ? selectedInternalUserItems.value.map((d) => d.name) : selectedExternalUserItems.value.map((d) => d.name),
            labels: labels.value.map((d) => d.name),
            is_external_user: state.activeTab !== AUTH_TYPE.INTERNAL_USER,
        };
        if (props.isProjectGroup) {
            params.project_group_id = props.projectGroupId;
            await SpaceConnector.client.identity.projectGroup.member.add(params);
        } else {
            params.project_id = props.projectId;
            await SpaceConnector.client.identity.project.member.add(params);
        }
        showSuccessMessage(t('PROJECT.DETAIL.MEMBER.ALS_S_ADD_MEMBER'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.DETAIL.MEMBER.ALT_E_ADD_MEMBER'));
    }
};
const listMember = async () => {
    try {
        let res;
        if (props.isProjectGroup) {
            res = await SpaceConnector.client.identity.projectGroup.member.list({
                project_group_id: props.projectGroupId,
            });
        } else {
            res = await SpaceConnector.client.identity.project.member.list({
                project_id: props.projectId,
            });
        }
        state.members = res.results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.members = [];
    }
};
const listExternalUser = debounce(async () => {
    if (!state.searchText.length) return;
    try {
        state.loading = true;
        const { results } = await SpaceConnector.client.identity.user.find({
            search: {
                keyword: state.searchText,
            },
        });
        state.externalUserItems = _getExternalMenuItems(results);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.externalUserItems = [];
    } finally {
        state.loading = false;
    }
}, 300);

/* Event */
const handleConfirm = async () => {
    await addMember();
    emit('confirm');
    state.proxyVisible = false;
};
const handleSearchExternalUser = (text) => {
    state.searchText = text;
    if (text.trim().length) listExternalUser();
};
const handleUpdateLabel = (inputLabels: InputItem[], isValid: boolean) => {
    isLabelDuplicated.value = !isValid;
    setForm('labels', inputLabels);
};
const handleUpdateExternalUser = async (inputUserItems: InputItem[], isValid: boolean) => {
    if (inputUserItems.length === selectedExternalUserItems.value.length) return;

    // when input deleted
    if (inputUserItems.length < selectedExternalUserItems.value.length) {
        const errorCodes = await Promise.all(inputUserItems.map((item) => setExternalItemsInvalidTexts(item)));
        const errors: ExternalItemsError = { all: !isValid ? 'DUPLICATED' : undefined };
        errorCodes.forEach((code, idx) => {
            if (code) errors[idx] = code;
        });
        selectedExternalUserItems.value = [...inputUserItems];
        externalItemsErrors.value = errors;
        return;
    }
    // when input added
    const addedIdx = inputUserItems.length - 1;
    const _addedUserItem = inputUserItems[addedIdx];
    const errors: ExternalItemsError = { ...externalItemsErrors.value, all: !isValid ? 'DUPLICATED' : undefined };
    const errorCode = await setExternalItemsInvalidTexts(_addedUserItem);
    if (errorCode) {
        _addedUserItem.error = true;
        errors[addedIdx] = errorCode;
    }
    selectedExternalUserItems.value = [...selectedExternalUserItems.value, _addedUserItem];
    externalItemsErrors.value = errors;
};
const handleSelectRoleItems = (roleItems: RoleMenuItem[]) => {
    if (!roleItems.length) return;
    const roleItem = { ...roleItems[0] };
    const pagePermissionMap = getPagePermissionMapFromRaw(roleItem.pagePermissions);
    setForm('selectedRoleItems', roleItems);
    state.showRoleWarning = !pagePermissionMap.project || pagePermissionMap.project === PAGE_PERMISSION_TYPE.VIEW;
};

/* Init */
(async () => {
    await Promise.allSettled([
        listMember(),
        listRoles(),
        // LOAD REFERENCE STORE
        store.dispatch('reference/user/load'),
    ]);
    await _setInternalMenuItems();
})();

/* Watcher */
watch(() => state.activeTab, () => {
    initForm();
    state.externalUserItems = [];
});

</script>

<template>
    <p-button-modal
        v-model:visible="state.proxyVisible"
        class="project-member-add-modal"
        :header-title="t('PROJECT.DETAIL.MEMBER.MODAL_INVITE_MEMBER_TITLE')"
        :fade="true"
        :backdrop="true"
        :disabled="!isAllValid || isLabelDuplicated || !!externalItemsInvalidTexts.length"
        @confirm="handleConfirm"
    >
        <template #body>
            <p-box-tab v-if="state.authType && state.authType !== 'GOOGLE_OAUTH2'"
                       v-model:activeTab="state.activeTab"
                       :tabs="state.tabs"
            />
            <div class="form-wrapper">
                <p class="title">
                    {{ t('PROJECT.DETAIL.MEMBER.MEMBER') }} ({{
                        state.activeTab === AUTH_TYPE.INTERNAL_USER ? selectedInternalUserItems.length : selectedExternalUserItems.length
                    }})
                </p>
                <p-field-group v-show="state.activeTab === AUTH_TYPE.INTERNAL_USER"
                               :label="t('PROJECT.DETAIL.MEMBER.MEMBER')"
                               required
                               :invalid="invalidState.selectedInternalUserItems"
                               :invalid-text="invalidTexts.selectedInternalUserItems"
                >
                    <template #default="{invalid}">
                        <p-filterable-dropdown
                            :menu="state.internalUserItems"
                            :selected="selectedInternalUserItems"
                            multi-selectable
                            appearance-type="stack"
                            show-select-marker
                            use-fixed-menu-style
                            :invalid="invalid"
                            @update:selected="setForm('selectedInternalUserItems', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group v-show="state.activeTab !== AUTH_TYPE.INTERNAL_USER"
                               :label="t('PROJECT.DETAIL.MEMBER.MEMBER')"
                               required
                               :invalid="externalItemsInvalidTexts.length > 0"
                >
                    <template #invalid>
                        <template v-for="(text, idx) in externalItemsInvalidTexts"
                                  :key="idx"
                        >
                            <span>{{ text }}</span>
                            <br>
                        </template>
                    </template>
                    <template #default="{invalid}">
                        <p-text-input :menu="state.externalUserItems"
                                      :value="state.searchText"
                                      :loading="state.loading"
                                      :selected="selectedExternalUserItems"
                                      :exact-mode="false"
                                      :invalid="invalid"
                                      multi-input
                                      appearance-type="stack"
                                      disable-handler
                                      use-fixed-menu-style
                                      use-auto-complete
                                      block
                                      @update:value="handleSearchExternalUser"
                                      @update="handleUpdateExternalUser"
                        />
                    </template>
                </p-field-group>
                <p-field-group :label="t('PROJECT.DETAIL.MEMBER.ROLE')"
                               required
                               :help-text="t('PROJECT.DETAIL.MEMBER.ROLE_HELP_TEXT')"
                               :invalid="invalidState.selectedRoleItems"
                               :invalid-text="invalidTexts.selectedRoleItems"
                >
                    <template #label-extra>
                        <p-tooltip class="help-icon"
                                   :contents="t('PROJECT.DETAIL.MEMBER.ROLE_TOOLTIP')"
                                   position="bottom"
                        >
                            <p-i name="ic_question-mark-circle"
                                 width="0.875rem"
                                 height="0.875rem"
                                 color="inherit"
                            />
                        </p-tooltip>
                        <span v-if="state.showRoleWarning"
                              class="role-warning-text"
                        >{{ t('PROJECT.DETAIL.MEMBER.ROLE_WARNING') }}</span>
                    </template>
                    <template #default="{invalid}">
                        <p-filterable-dropdown
                            :menu="state.roleItems"
                            :selected="selectedRoleItems"
                            show-select-marker
                            use-fixed-menu-style
                            :invalid="invalid"
                            @update:selected="handleSelectRoleItems"
                        />
                    </template>
                </p-field-group>
                <p-field-group
                    :label="t('PROJECT.DETAIL.MEMBER.LABEL_LABEL')"
                    :help-text="t('PROJECT.DETAIL.MEMBER.LABEL_HELP_TEXT')"
                    :invalid="invalidState.labels || isLabelDuplicated"
                    :invalid-text="invalidTexts.labels || t('PROJECT.DETAIL.MEMBER.DUPLICATED_VALUE')"
                >
                    <template #default="{invalid}">
                        <p-text-input :selected="labels"
                                      :invalid="invalid"
                                      multi-input
                                      appearance-type="stack"
                                      block
                                      @update="handleUpdateLabel"
                        />
                    </template>
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.project-member-add-modal {
    /* custom design-system component - p-box-tab */
    :deep(.p-box-tab) {
        .tab-pane {
            padding: 0;
        }
    }
    .form-wrapper {
        height: 30rem;

        .title {
            @apply text-gray-900;
            font-size: 1.375rem;
            line-height: 1.25;
            padding-bottom: 1rem;
        }

        .help-icon {
            @apply text-gray-400;
        }
        .role-warning-text {
            @apply text-red-500;
            font-size: 0.75rem;
            padding-left: 0.5rem;
        }
    }
}
</style>
