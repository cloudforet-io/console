<script lang="ts" setup>
import {
    reactive, computed, watch, ref,
} from 'vue';

import {
    PButtonModal, PFieldGroup, PBoxTab, PSelectDropdown, PTextInput,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import type { InputItem } from '@spaceone/design-system/types/inputs/input/text-input/type';
import { debounce, union } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProjectAddUsersRequestParams } from '@/schema/identity/project/api-verbs/add-users';
import type { ProjectGetRequestParams } from '@/schema/identity/project/api-verbs/get';
import type { ProjectModel } from '@/schema/identity/project/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { checkEmailFormat } from '@/services/administration/helpers/user-management-form-validations';


const AUTH_TYPE = {
    INTERNAL_USER: 'INTERNAL_USER',
    KEYCLOAK: 'KEYCLOAK',
    GOOGLE_OAUTH2: 'GOOGLE_OAUTH2',
} as const;
type ExternalItemErrorCode = 'DUPLICATED'|'EMAIL_FORMAT'|'ALREADY_EXIST'|'NOT_FOUND';

interface Props {
    visible?: boolean;
    projectId?: string;
}
interface ExternalItemsError {
    all?: ExternalItemErrorCode;
    [selectedIndex: number]: ExternalItemErrorCode
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    projectId: undefined,
});

const emit = defineEmits<{(e: 'confirm'): void;
}>();

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    authType: computed(() => store.state.domain.extendedAuthType),
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
    projectUserIdList: [] as string[],
    //
    tabs: computed(() => {
        const tabs = [
            {
                name: AUTH_TYPE.INTERNAL_USER,
                label: i18n.t('PROJECT.DETAIL.MEMBER.ADD_FROM', { user_type: i18n.t('PROJECT.DETAIL.MEMBER.INTERNAL_USER') }),
            },
        ];
        if (state.authType === AUTH_TYPE.KEYCLOAK) {
            tabs.push({
                name: AUTH_TYPE.KEYCLOAK,
                label: i18n.t('PROJECT.DETAIL.MEMBER.ADD_FROM', { user_type: i18n.t('PROJECT.DETAIL.MEMBER.KEYCLOAK') }),
            });
        }
        return tabs;
    }),
    activeTab: AUTH_TYPE.INTERNAL_USER,
    internalUserItems: [] as SelectDropdownMenuItem[],
    externalUserItems: [] as InputItem[],
    invalidUserList: [] as string[],
    existingMemberList: [] as string[],
    searchText: '',
    labelText: '',
});
const externalItemsErrors = ref<ExternalItemsError>({});
const externalItemsInvalidTexts = computed(() => {
    const errorCodes = union(Object.values(externalItemsErrors.value)).filter((code) => !!code);
    return errorCodes.map((code) => {
        if (code === 'DUPLICATED') return i18n.t('PROJECT.DETAIL.MEMBER.DUPLICATED_VALUE');
        if (code === 'EMAIL_FORMAT') return i18n.t('IDENTITY.USER.FORM.EMAIL_INVALID');
        if (code === 'ALREADY_EXIST') return i18n.t('PROJECT.DETAIL.MEMBER.ALREADY_EXISTING');
        if (code === 'NOT_FOUND') return i18n.t('PROJECT.DETAIL.MEMBER.INVALID');
        return undefined;
    });
});
const selectedExternalUserItems = ref<InputItem[]>([]);
const {
    forms: {
        selectedInternalUserItems,
    },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
} = useFormValidator({
    selectedInternalUserItems: [] as SelectDropdownMenuItem[],
}, {
    selectedInternalUserItems: (val: SelectDropdownMenuItem[]) => {
        if (!val.length) return i18n.t('PROJECT.DETAIL.MEMBER.MODAL_VALIDATION_REQUIRED');
        return true;
    },
});

/* Util */
const _setInternalMenuItems = () => {
    state.internalUserItems = [];
    Object.keys(state.users).forEach((userId) => {
        const userName = state.users[userId]?.name;
        const singleItem = {
            name: userId,
            label: userName ? `${userId} (${userName})` : userId,
            disabled: false,
        };
        if (state.projectUserIdList.includes(userId)) {
            singleItem.disabled = true;
        }
        state.internalUserItems.push(singleItem);
    });
};
const _getExternalMenuItems = (users: {user_id: string; name: string;}[]): InputItem[] => {
    const externalUserItems: InputItem[] = [];
    users.forEach((user) => {
        const singleItem = {
            name: user.user_id,
            label: user.name ? `${user.user_id} (${user.name})` : user.user_id,
            disabled: false,
        };
        if (state.projectUserIdList.includes(user.user_id)) {
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
    if (state.projectUserIdList.includes(userItem.name ?? '')) {
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
const addMember = async () => {
    try {
        const params: ProjectAddUsersRequestParams = {
            project_id: props.projectId,
            users: state.activeTab === AUTH_TYPE.INTERNAL_USER ? selectedInternalUserItems.value.map((d) => d.name) : selectedExternalUserItems.value.map((d) => d.name),
        };
        await SpaceConnector.clientV2.identity.project.addUsers(params);
        showSuccessMessage(i18n.t('PROJECT.DETAIL.MEMBER.ALS_S_ADD_MEMBER'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.MEMBER.ALT_E_ADD_MEMBER'));
    }
};
const getProjectUserData = async () => {
    try {
        const params: ProjectGetRequestParams = {
            project_id: props.projectId,
        };
        const res: ProjectModel = await SpaceConnector.clientV2.identity.project.get(params);
        state.projectUserIdList = res.users;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectUserIdList = [];
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

/* Init */
(async () => {
    await Promise.allSettled([
        getProjectUserData(),
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
        class="project-member-invite-modal"
        :header-title="$t('PROJECT.DETAIL.MEMBER.MODAL_INVITE_MEMBER_TITLE')"
        :fade="true"
        :backdrop="true"
        :visible.sync="state.proxyVisible"
        :disabled="!isAllValid || !!externalItemsInvalidTexts.length"
        @confirm="handleConfirm"
    >
        <template #body>
            <p-box-tab v-if="state.authType && state.authType !== 'GOOGLE_OAUTH2'"
                       v-model="state.activeTab"
                       :tabs="state.tabs"
            />
            <div class="form-wrapper">
                <p class="title">
                    {{ $t('PROJECT.DETAIL.MEMBER.MEMBER') }} ({{
                        state.activeTab === AUTH_TYPE.INTERNAL_USER ? selectedInternalUserItems.length : selectedExternalUserItems.length
                    }})
                </p>
                <p-field-group v-show="state.activeTab === AUTH_TYPE.INTERNAL_USER"
                               :label="$t('PROJECT.DETAIL.MEMBER.MEMBER')"
                               required
                               :invalid="invalidState.selectedInternalUserItems"
                               :invalid-text="invalidTexts.selectedInternalUserItems"
                >
                    <template #default="{invalid}">
                        <p-select-dropdown
                            :menu="state.internalUserItems"
                            :selected="selectedInternalUserItems"
                            multi-selectable
                            appearance-type="stack"
                            show-select-marker
                            is-filterable
                            show-delete-all-button
                            use-fixed-menu-style
                            :invalid="invalid"
                            @update:selected="setForm('selectedInternalUserItems', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group v-show="state.activeTab !== AUTH_TYPE.INTERNAL_USER"
                               :label="$t('PROJECT.DETAIL.MEMBER.MEMBER')"
                               required
                               :invalid="externalItemsInvalidTexts.length > 0"
                >
                    <template #invalid>
                        <template v-for="(text, idx) in externalItemsInvalidTexts">
                            <span :key="idx">{{ text }}</span>
                            <br :key="`br-${idx}`">
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
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.project-member-invite-modal {
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
    }
}
</style>
