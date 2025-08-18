<script lang="ts" setup>
import {
    computed, reactive, ref, watch,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal, PButton, PLazyImg } from '@cloudforet/mirinae';

import { useUserGroupChannelApi } from '@/api-clients/alert-manager/user-group-channel/composables/use-user-group-channel-api';
import type { UserGroupChannelCreateParameters } from '@/api-clients/alert-manager/user-group-channel/schema/api-verbs/create';
import type { UserGroupChannelUpdateParameters } from '@/api-clients/alert-manager/user-group-channel/schema/api-verbs/update';
import type {
    UserGroupChannelScheduleInfoType,
} from '@/api-clients/alert-manager/user-group-channel/schema/type';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserGroupChannelScheduleSetForm from '@/services/iam/components/UserGroupChannelScheduleSetForm.vue';
import UserGroupChannelSetInputForm from '@/services/iam/components/UserGroupChannelSetInputForm.vue';
import { useUserGroupChannelGetQuery } from '@/services/iam/composables/use-user-group-channel-get-query';
import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';


const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();
const notificationChannelCreateFormState = notificationChannelCreateFormStore.state;

const emit = defineEmits<{(e: 'confirm'): void; }>();

interface ChannelSetModalState {
  loading: boolean;
  channelName: string;
  scheduleInfo: UserGroupChannelScheduleInfoType;
}

const isCreateAble = ref<boolean>(false);
const isSchemaValid = ref<boolean>(false);

const queryClient = useQueryClient();
const { userGroupChannelAPI } = useUserGroupChannelApi();
const { key: userGroupChannelListQueryKey } = useServiceQueryKey('alert-manager', 'user-group-channel', 'list');
const { userGroupChannelGetQueryKey } = useUserGroupChannelGetQuery();

const storeState = reactive({
    protocolIcon: computed<string>(() => notificationChannelCreateFormState.selectedProtocol.icon),
    protocolName: computed<string>(() => notificationChannelCreateFormState.selectedProtocol.name),
    protocolId: computed<string>(() => notificationChannelCreateFormState.selectedProtocol.protocol_id),
});

const state = reactive<ChannelSetModalState>({
    loading: false,
    channelName: '',
    scheduleInfo: notificationChannelCreateFormState.scheduleInfo,
});

const { mutateAsync: userGroupChannelMutate } = useMutation({
    mutationFn: async (params: UserGroupChannelCreateParameters|UserGroupChannelUpdateParameters) => {
        const res = userGroupPageState.modal.title === i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE')
            ? await userGroupChannelAPI.create(params as UserGroupChannelCreateParameters)
            : await userGroupChannelAPI.update(params as UserGroupChannelUpdateParameters);
        await queryClient.invalidateQueries({ queryKey: userGroupChannelListQueryKey.value });
        const cid = userGroupPageGetters.selectedUserGroupChannel?.[0]?.channel_id;
        if (cid) {
            await queryClient.invalidateQueries({ queryKey: userGroupChannelGetQueryKey.value });
        }
        return res;
    },
    onSuccess: () => {
        emit('confirm');
        if (userGroupPageState.modal.title === i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE')) {
            showSuccessMessage(i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.SUCCESS_MESSAGE'), '');
        } else {
            showSuccessMessage(i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.UPDATE_SUCCESS_MESSAGE'), '');
        }
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
    onSettled: () => {
        notificationChannelCreateFormStore.initState();
        userGroupPageState.modal = {
            type: '',
            title: '',
            themeColor: 'primary',
        };
    },
});

/* Component */
const handleChannelName = (value: string) => {
    state.channelName = value;
};

const handleSchemaValid = (value: boolean) => {
    if (userGroupPageState.modal.title === i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE')) {
        isSchemaValid.value = value;
    } else {
        isSchemaValid.value = true;
    }
};

const handleConfirm = async () => {
    const params: UserGroupChannelCreateParameters|UserGroupChannelUpdateParameters = userGroupPageState.modal.title === i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE') ? {
        protocol_id: notificationChannelCreateFormState.selectedProtocol.protocol_id,
        name: state.channelName,
        schedule: notificationChannelCreateFormState.scheduleInfo,
        data: {
            ...notificationChannelCreateFormState.protocolSchemaForm,
        },
        tags: {},
        user_group_id: userGroupPageGetters.selectedUserGroups[0].user_group_id,
    } as UserGroupChannelCreateParameters : {
        channel_id: userGroupPageGetters.selectedUserGroupChannel[0].channel_id,
        name: state.channelName,
        data: {},
        schedule: notificationChannelCreateFormState.scheduleInfo,
    } as UserGroupChannelUpdateParameters;
    await userGroupChannelMutate(params);
};

const handleCancel = () => {
    if (userGroupPageState.modal.title === i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE')) {
        userGroupPageState.modal = {
            type: USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_FIRST,
            title: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE'),
            themeColor: 'primary1',
        };
        notificationChannelCreateFormStore.initState();
        userGroupPageStore.selectedUserGroupChannelIdx([]);
    } else {
        handleClose();
    }
};

const handleClose = () => {
    notificationChannelCreateFormStore.initState();
    userGroupPageStore.selectedUserGroupChannelIdx([]);
    userGroupPageState.modal = {
        type: '',
        title: '',
        themeColor: 'primary',
    };
};

/* Watcher */
watch([() => notificationChannelCreateFormState, isSchemaValid], (nv_channel_state, nv_is_schema_valid) => {
    // isCreateAble.value = !!nv_channel_state.channelName;
    isCreateAble.value = !!(nv_channel_state && nv_is_schema_valid);
}, { immediate: true, deep: true });
</script>

<template>
    <div>
        <p-button-modal size="md"
                        :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_SECOND"
                        :header-title="userGroupPageState.modal.title"
                        :theme-color="userGroupPageState.modal.themeColor"
                        :disabled="!isSchemaValid"
                        @confirm="handleConfirm"
                        @cancel="handleCancel"
                        @close="handleClose"
        >
            <template #body>
                <div v-if="userGroupPageState.modal.title === i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE')"
                     class="flex flex-col gap-1 mb-8"
                >
                    <p class="text-xs">
                        <span>Step 2</span>
                        <span class="text-gray-500">/2</span>
                    </p>
                    <span class="text-gray-700 leading-4 text-sm">{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.INFO') }}</span>
                </div>
                <div class="flex items-center gap-4 mb-8">
                    <p-lazy-img :src="assetUrlConverter(storeState.protocolIcon)"
                                width="4rem"
                                height="4rem"
                                error-icon="ic_notification-protocol_envelope"
                    />
                    <div class="flex flex-col gap-0.5">
                        <span class="text-lg font-medium">{{ storeState.protocolName }}</span>
                    </div>
                </div>
                <user-group-channel-set-input-form @update-channel-name="handleChannelName"
                                                   @update-valid="handleSchemaValid"
                />
                <user-group-channel-schedule-set-form />
            </template>
            <template v-if="userGroupPageState.modal.title === i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE')"
                      #close-button
            >
                <p-button icon-left="ic_arrow-left"
                          style-type="transparent"
                >
                    <span class="text-base">{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.GO_BACK') }}</span>
                </p-button>
            </template>
            <template #confirm-button>
                <span v-if="userGroupPageState.modal.title === i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.UPDATE_TITLE')">{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.UPDATE') }}</span>
                <span v-else>{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.CREATE') }}</span>
            </template>
        </p-button-modal>
    </div>
</template>
