<script lang="ts" setup>
import { reactive } from 'vue';

import { PButtonModal, PI, PButton } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import UserGroupChannelScheduleSetForm from '@/services/iam/components/UserGroupChannelScheduleSetForm.vue';
import UserGroupChannelSetInputForm from '@/services/iam/components/UserGroupChannelSetInputForm.vue';
import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

const state = reactive({
    loading: false,
});

/* Component */
const handleConfirm = async () => {
    try {
        state.loading = true;
        await fetchCreateUserGroupChannel();
    } finally {
        state.loading = false;
        userGroupPageState.modal = {
            type: '',
            title: '',
            themeColor: 'primary',
        };
    }
};

const handleCancel = () => {
    userGroupPageState.modal = {
        type: USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_FIRST,
        title: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE'),
        themeColor: 'primary1',
    };
};

/* API */
const fetchCreateUserGroupChannel = async () => {};
</script>

<template>
    <div>
        <p-button-modal size="md"
                        :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_SECOND"
                        :header-title="userGroupPageState.modal.title"
                        :theme-color="userGroupPageState.modal.themeColor"
                        @confirm="handleConfirm"
                        @cancel="handleCancel"
        >
            <template #body>
                <div class="flex flex-col gap-1 mb-8">
                    <!--              TODO: need to modify-->
                    <p class="text-xs">
                        <span>Step 2</span>
                        <span class="text-gray-500">/2</span>
                    </p>
                    <span class="text-gray-700 leading-4 text-sm">{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.INFO') }}</span>
                    <div class="flex mt-8">
                        <p-i name="ic_notification-protocol_users"
                             width="2.5rem"
                             height="2.5rem"
                        />
                        <p class="flex flex-col">
                            <span class="text-lg">{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.NOTIFY_TO_MEMBER') }}</span>
                            <span class="text-xs text-gray-600">{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.NOTIFY_TO_MEMBER_INFO') }}</span>
                        </p>
                    </div>
                </div>
                <user-group-channel-set-input-form />
                <user-group-channel-schedule-set-form />
            </template>
            <template #close-button>
                <p-button icon-left="ic_arrow-left"
                          style-type="transparent"
                >
                    <span class="text-base">{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.GO_BACK') }}</span>
                </p-button>
            </template>
            <template #confirm-button>
                <span>{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.CREATE') }}</span>
            </template>
        </p-button-modal>
    </div>
</template>
