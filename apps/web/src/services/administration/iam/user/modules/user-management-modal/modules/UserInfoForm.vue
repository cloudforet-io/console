<template>
    <div class="user-info-form-wrapper">
        <p-field-group :label="t('IDENTITY.USER.FORM.USER_ID')"
                       :required="true"
                       :invalid="validationState.isUserIdValid === false"
                       :invalid-text="validationState.userIdInvalidText"
                       :valid="validationState.isUserIdValid"
                       :valid-text="validationState.userIdValidText"
        >
            <template v-if="props.activeTab === 'external'
                          && state.supportFind
                          && state.externalItems.length > 100"
                      #help
            >
                <div class="external-items-help-text">
                    <span>{{ t('IDENTITY.USER.FORM.TOO_MANY_RESULTS') }}</span>
                </div>
            </template>
            <template #default="{invalid}">
                <div v-if="props.activeTab === 'external' && state.supportFind">
                    <p-filterable-dropdown
                        v-model:search-text="state.searchText"
                        v-model:selected="state.selectedItems"
                        :class="{invalid}"
                        show-select-marker
                        :menu="state.externalItems"
                        :loading="state.loading"
                        disable-handler
                        :exact-mode="false"
                        use-fixed-menu-style
                        @select="handleSelectExternalUser"
                        @delete-tag="handleDeleteSelectedExternalUser"
                    />
                </div>
                <div v-else
                     class="id-input-form"
                >
                    <p-text-input ref="inputRef"
                                  v-model="formState.userId"
                                  :placeholder="!userPageState.visibleUpdateModal ? store.state.user.userId : ''"
                                  :invalid="invalid"
                                  :disabled="userPageState.visibleUpdateModal"
                                  class="text-input"
                    />
                    <p-button v-if="!userPageState.visibleUpdateModal"
                              style-type="secondary"
                              class="user-id-check-button"
                              @click="handleClickCheckId"
                    >
                        {{ t('IDENTITY.USER.FORM.CHECK_USER_ID') }}
                    </p-button>
                </div>
            </template>
        </p-field-group>
        <p-field-group :label="t('IDENTITY.USER.FORM.NAME')"
                       class="input-form"
        >
            <p-text-input v-model="formState.name"
                          class="text-input"
                          @update:value="handleChangeInput"
            />
        </p-field-group>
    </div>
</template>

<script setup lang="ts">
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PTextInput, PButton, PFilterableDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { useFocus } from '@vueuse/core';
import { debounce } from 'lodash';
import {
    computed, reactive, watch, ref,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    Validation,
} from '@/services/administration/iam/user/lib/user-form-validations';
import {
    checkDuplicateID,
    checkEmailFormat, checkEmptyValue,
    checkOauth,
    checkRequiredField,
} from '@/services/administration/iam/user/lib/user-form-validations';
import type { User } from '@/services/administration/iam/user/type';
import { useUserPageStore } from '@/services/administration/store/user-page-store';
import type { ExternalMenuType } from '@/services/administration/type';

interface Props {
    activeTab?: string;
    item?: User;
}
const props = withDefaults(defineProps<Props>(), {
    activeTab: '',
    item: undefined,
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const emit = defineEmits<{(e: 'change-input', formState): void}>();
const store = useStore();
const { t } = useI18n();

const inputRef = ref(null as null|HTMLInputElement);
useFocus(inputRef, { initialValue: true });

const state = reactive({
    loading: false,
    searchText: '',
    selectedItems: [] as MenuItem[],
    externalItems: [] as MenuItem[],
    supportFind: computed(() => !!store.state.domain.authOptions?.support_find),
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
});
const formState = reactive({
    userId: '',
    name: '',
});
const validationState = reactive({
    isUserIdValid: undefined as undefined | boolean,
    userIdInvalidText: '' as string,
    userIdValidText: '' as string,
});

/* Components */
const setExternalMenuItems = (users) => {
    const _externalItems: ExternalMenuType[] = [];
    users.forEach((user) => {
        const singleItem = {
            name: user.userId,
            label: user.name ? `${user.userId} (${user.name})` : user.userId,
            disabled: false,
        };
        if (state.users[user.userId]) {
            singleItem.label = `(${t('IDENTITY.USER.FORM.ALREADY_EXISTS')}) ${singleItem.label}`;
            singleItem.disabled = true;
        }
        _externalItems.push(singleItem);
    });
    state.externalItems = _externalItems;
};
const handleDeleteSelectedExternalUser = () => {
    formState.userId = '';
    formState.name = '';
    validationState.isUserIdValid = undefined;
    validationState.userIdInvalidText = '';
};
const handleSelectExternalUser = async (userItem) => {
    await getExternalUser(userItem.name);
    await handleClickCheckId();
};
const handleChangeInput = () => {
    emit('change-input', { ...formState, name: formState.name });
};
const setForm = () => {
    formState.userId = props.item?.user_id || '';
    formState.name = props.item?.name || '';
};

/* API */
const listExternalUser = debounce(async () => {
    try {
        state.loading = true;
        const { results } = await SpaceConnector.client.identity.user.find({
            search: {
                keyword: state.searchText,
            },
        });
        await setExternalMenuItems(results);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.externalItems = [];
    } finally {
        state.loading = false;
    }
}, 300);
const getExternalUser = async (userId: string) => {
    try {
        const { results, total_count } = await SpaceConnector.client.identity.user.find({
            search: {
                userId,
            },
        });
        if (total_count > 0) {
            const selectedExternalUser = results[0];
            formState.userId = selectedExternalUser.userId;

            if (state.users[userId]) {
                formState.name = '';
            } else {
                formState.name = selectedExternalUser.name;
            }
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        formState.userId = userId;
        formState.name = '';
    }
};

const executeSpecificIDValidation = async () => {
    let res: Validation = { isValid: true, invalidText: '' };
    if (props.activeTab === 'local') res = checkEmailFormat(formState.userId);
    else if (props.activeTab === 'external') res = await checkOauth(formState.userId);
    return res;
};
const handleClickCheckId = async () => {
    const validation: Validation[] = await Promise.all([
        checkRequiredField(formState.userId),
        checkDuplicateID(formState.userId),
        checkEmptyValue(formState.userId),
        executeSpecificIDValidation()]);
    const invalidObj = validation.find((item) => item.invalidText.length > 0);
    if (!invalidObj) {
        validationState.isUserIdValid = true;
        emit('change-input', { ...formState, userId: formState.userId });
    } else {
        validationState.isUserIdValid = invalidObj.isValid;
        validationState.userIdInvalidText = invalidObj.invalidText;
    }
};

/* Init */
(async () => {
    if (userPageState.visibleUpdateModal) {
        await setForm();
    }
})();

watch(() => props.activeTab, (after) => {
    if (after) {
        state.selectedItems = [];
    }
}, { immediate: true });
watch(() => state.searchText, (searchText) => {
    if (!searchText.trim().length) {
        state.externalItems = [];
    } else {
        listExternalUser();
    }
});
</script>

<style lang="postcss" scoped>
.user-info-form-wrapper {
    @apply flex flex-col bg-white rounded-lg;
    padding: 0.75rem;
    gap: 1rem;
    .external-items-help-text {
        @apply text-gray-400;
        font-size: 0.75rem;
        line-height: 1.3;
        padding: 0.25rem 0;
    }
    .p-filterable-dropdown {
        &.invalid {
            .p-search {
                @apply border-alert;
            }
        }
    }
    .id-input-form {
        @apply flex;
        gap: 0.5rem;
    }
    .p-field-group {
        margin-bottom: 0;

        /* custom design-system component - p-text-input */
        :deep(.p-text-input) {
            width: 100%;
        }
    }
}
</style>
