<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { partition, reject, map } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PButtonModal, PPaneLayout, PFieldGroup, PFieldTitle, PDataLoader, PIconButton, PAvatar, screens, PEmpty,
} from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleType } from '@/api-clients/identity/role/type';
import type { ServiceChangeMembersParameters } from '@/schema/alert-manager/service/api-verbs/chagne-members';
import { MEMBERS_TYPE } from '@/schema/alert-manager/service/constants';
import type { MembersType } from '@/schema/alert-manager/service/type';
import { i18n } from '@/translations';

import type { UserGroupReferenceMap } from '@/store/reference/user-group-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useProxyValue } from '@/common/composables/proxy-state';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { indigo } from '@/styles/colors';

import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type { Service } from '@/services/alert-manager/types/alert-manager-type';
import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';

type modalMode = 'member' | 'invitation';

type ModalInfoType = {
    title: TranslateResult;
    size: string;
};
type MemberInfoType = {
    roleType?: RoleType;
    label: string;
    type: MembersType;
    key: string;
};
interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const { width } = useWindowSize();
const { hasReadWriteAccess } = usePageEditableStatus();

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const storeState = reactive({
    serviceInfo: computed<Service>(() => serviceDetailPageGetters.serviceInfo),
    userMap: computed<UserReferenceMap>(() => serviceDetailPageGetters.userReferenceMap),
    userGroupMap: computed<UserGroupReferenceMap>(() => serviceDetailPageGetters.userGroupReferenceMap),
});
const state = reactive({
    loading: false,
    isMobileSize: computed(() => width.value < screens.mobile.max),
    proxyVisible: useProxyValue('visible', props, emit),
    mode: 'member' as modalMode,
    modalInfo: computed<ModalInfoType>(() => {
        switch (state.mode) {
        case 'member':
            return {
                title: i18n.t('ALERT_MANAGER.SERVICE.SERVICE_MEMBER'),
                size: 'md',
            };
        case 'invitation':
            return {
                title: i18n.t('ALERT_MANAGER.SERVICE.INVITE_MEMBER'),
                size: 'sm',
            };
        default:
            return {} as ModalInfoType;
        }
    }),
    memberList: computed<MemberInfoType[]>(() => {
        const userList = storeState.serviceInfo.members.USER.map((i) => {
            const user = storeState.userMap[i];
            return {
                roleType: user?.data.roleInfo?.role_type,
                label: user?.label,
                type: MEMBERS_TYPE.USER,
                key: user?.key,
            };
        });
        const userGroupList = storeState.serviceInfo.members.USER_GROUP.map((i) => {
            const userGroup = storeState.userGroupMap[i];
            return {
                label: userGroup?.name || '',
                type: MEMBERS_TYPE.USER_GROUP,
                key: userGroup?.key,
            };
        });
        return [...userList, ...userGroupList];
    }),
    userList: computed<MemberInfoType[]>(() => state.memberList.filter((i) => i.type === 'USER').map((i) => i.key)),
    userGroupList: computed<MemberInfoType[]>(() => state.memberList.filter((i) => i.type === 'USER_GROUP').map((i) => i.key)),
    excludedSelectedIds: [] as string[],
    formattedMemberItems: {} as Record<MembersType, string[]>,
});

const formatRoleType = (roleType: RoleType) => roleType?.toLowerCase().replace(/_/g, ' ').replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());

const handleFormattedSelectedIds = (value: Record<MembersType, string[]>) => {
    state.formattedMemberItems = value;
};
const handleClickInviteButton = () => {
    state.excludedSelectedIds = [
        ...state.userList.map((i) => i),
        ...state.userGroupList.map((i) => i),
    ];
    state.mode = 'invitation';
};
const handleClose = () => {
    state.proxyVisible = false;
};
const handleConfirm = async () => {
    if (state.mode === 'member') {
        handleClose();
    } else {
        await inviteMember();
    }
};
const handleRemoveMember = async (key: string) => {
    const _memberList = reject(state.memberList, { key });
    const [userList, userGroupList] = partition(_memberList, { type: 'USER' });
    const selectedWorkspaceMemberList = map(userList, 'key');
    const selectedUserGroupList = map(userGroupList, 'key');
    await fetcherChangeMembers(selectedWorkspaceMemberList, selectedUserGroupList);
};
const inviteMember = async () => {
    state.loading = true;
    try {
        const [defaultUserList, defaultUserGroupList] = partition(state.memberList, { type: 'USER' });

        const _defaultUserList = map(defaultUserList, 'key');
        const _defaultUserGroupList = map(defaultUserGroupList, 'key');

        await fetcherChangeMembers(
            [..._defaultUserList, ...state.formattedMemberItems.USER],
            [..._defaultUserGroupList, ...state.formattedMemberItems.USER_GROUP],
        );
    } finally {
        state.loading = false;
        state.mode = 'member';
        state.excludedSelectedIds = [];
    }
};

const fetcherChangeMembers = async (userData: string[], userGroupData: string[]) => {
    try {
        await SpaceConnector.clientV2.alertManager.service.changeMembers<ServiceChangeMembersParameters>({
            service_id: storeState.serviceInfo.service_id,
            members: {
                USER: userData,
                USER_GROUP: userGroupData,
            },
        });
        if (state.mode === 'invitation') {
            showSuccessMessage(i18n.t('ALERT_MANAGER.SERVICE.ALT_S_INVITE_MEMBER'), '');
        }
        await serviceDetailPageStore.fetchServiceDetailData(storeState.serviceInfo.service_id);
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};
</script>

<template>
    <p-button-modal class="service-detail-invitation-modal"
                    :header-title="state.modalInfo.title"
                    :size="state.modalInfo.size"
                    :fade="true"
                    :backdrop="true"
                    :visible="state.proxyVisible"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div>
                <div v-if="state.mode === 'member'"
                     class="bg-violet-100 p-4 rounded-md"
                >
                    <p-data-loader :loading="false">
                        <p-pane-layout class="member-list p-3">
                            <p-field-group class="title flex items-center">
                                <p-field-title :label="$t('ALERT_MANAGER.SERVICE.INVITE_MEMBER_DESC')"
                                               required
                                />
                                <p-button v-if="hasReadWriteAccess"
                                          style-type="tertiary"
                                          icon-left="ic_plus_bold"
                                          class="ml-auto"
                                          @click="handleClickInviteButton"
                                >
                                    {{ $t('ALERT_MANAGER.SERVICE.INVITE') }}
                                </p-button>
                            </p-field-group>
                            <div v-if="state.memberList.length > 0">
                                <div v-for="(item, idx) in state.memberList"
                                     :key="`member-item-${idx}`"
                                     class="flex items-center justify-between p-2 text-label-md"
                                >
                                    <div class="member-info-content">
                                        <p v-if="!state.isMobileSize"
                                           class="inline"
                                        >
                                            <img v-if="item.type === MEMBERS_TYPE.USER"
                                                 :src="useRoleFormatter(item?.roleType || ROLE_TYPE.USER).image"
                                                 alt="Role Type Icon"
                                                 class="role-image"
                                            >
                                            <p-avatar v-else
                                                      class="menu-icon"
                                                      icon="ic_member"
                                                      :color="indigo[300]"
                                                      size="sm"
                                            />
                                        </p>
                                        <span>{{ item?.label }}</span>
                                    </div>
                                    <p class="member-info-content">
                                        <span v-if="!state.isMobileSize"
                                              class="text-gray-500"
                                        >
                                            {{ item.type === MEMBERS_TYPE.USER ? formatRoleType(item?.roleType) : $t('ALERT_MANAGER.SERVICE.USER_GROUP') }}
                                        </span>
                                        <p-icon-button name="ic_delete"
                                                       size="sm"
                                                       @click="handleRemoveMember(item.key)"
                                        />
                                    </p>
                                </div>
                            </div>

                            <p-empty v-else
                                     show-image
                                     class="pt-12"
                                     :title="$t('ALERT_MANAGER.SERVICE.EMPTY_MEMBER')"
                            />
                        </p-pane-layout>
                    </p-data-loader>
                </div>
                <div v-else
                     class="py-4"
                >
                    <p class="pb-2">
                        {{ $t('ALERT_MANAGER.SERVICE.INVITE_MEMBER_DESC') }}
                    </p>
                    <user-select-dropdown selection-type="multiple"
                                          appearance-type="stack"
                                          use-fixed-menu-style
                                          excluded-hidden-ids
                                          :excluded-selected-ids="state.excludedSelectedIds"
                                          :placeholder="$t('ALERT_MANAGER.SERVICE.MODAL_MEMBER_PLACEHOLDER')"
                                          @formatted-selected-ids="handleFormattedSelectedIds"
                    />
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.service-detail-invitation-modal {
    .member-list {
        min-height: 23rem;
        .title {
            margin-bottom: 0.5rem;
        }
        .member-info-content {
            @apply flex items-center gap-2;
            .role-image {
                @apply rounded-full;
                width: 1.5rem;
                height: 1.5rem;
            }
        }
    }
}
</style>
