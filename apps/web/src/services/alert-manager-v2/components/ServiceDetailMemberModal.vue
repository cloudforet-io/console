<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PButtonModal, PPaneLayout, PFieldGroup, PFieldTitle, PDataLoader, PIconButton, PAvatar,
} from '@cloudforet/mirinae';

import type { ServiceChangeMembersParameters } from '@/schema/alert-manager/service/api-verbs/chagne-members';
import { MEMBERS_TYPE } from '@/schema/alert-manager/service/constants';
import type { MembersType } from '@/schema/alert-manager/service/type';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserGroupReferenceMap } from '@/store/reference/user-group-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import type { SelectedUserDropdownIdsType } from '@/common/modules/user/typte';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { indigo } from '@/styles/colors';

import { useServiceDetailPageStore } from '@/services/alert-manager-v2/stores/service-detail-page-store';
import type { Service } from '@/services/alert-manager-v2/types/alert-manager-type';
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

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const storeState = reactive({
    serviceInfo: computed<Service>(() => serviceDetailPageGetters.serviceInfo),
    userMap: computed<UserReferenceMap>(() => allReferenceGetters.user),
    userGroupMap: computed<UserGroupReferenceMap>(() => allReferenceGetters.user_group),
});
const state = reactive({
    loading: false,
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
                roleType: user.data.roleInfo?.role_type,
                label: user.label,
                type: MEMBERS_TYPE.USER,
                key: user.key,
            };
        });
        const userGroupList = storeState.serviceInfo.members.USER_GROUP.map((i) => {
            const userGroup = storeState.userGroupMap[i];
            return {
                label: userGroup.name,
                type: MEMBERS_TYPE.USER_GROUP,
                key: userGroup.key,
            };
        });
        return [...userList, ...userGroupList];
    }),
    selectedMemberItems: [] as SelectedUserDropdownIdsType[],
});

const handleClickInviteButton = () => {
    state.mode = 'invitation';
};
const handleConfirm = async () => {
    if (state.mode === 'member') {
        handleClose();
    } else {
        await inviteMember();
    }
};

const handleRemoveMember = async (key: string) => {
    const _memberList = state.memberList.filter((i) => i.key !== key);
    try {
        const selectedWorkspaceMemberList = _memberList.filter((i) => i.type === 'USER').map((i) => i.key);
        const selectedUserGroupList = _memberList.filter((i) => i.type === 'USER_GROUP').map((i) => i.key);
        await SpaceConnector.clientV2.alertManager.service.changeMember<ServiceChangeMembersParameters>({
            service_id: storeState.serviceInfo.service_id,
            members: {
                USER: selectedWorkspaceMemberList,
                USER_GROUP: selectedUserGroupList,
            },
        });
        await serviceDetailPageStore.fetchServiceDetailData(storeState.serviceInfo.service_id);
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};
const inviteMember = async () => {
    state.loading = true;
    try {
        const selectedWorkspaceMemberList = state.selectedMemberItems.filter((i) => i.type === 'USER').map((i) => i.value);
        const selectedUserGroupList = state.selectedMemberItems.filter((i) => i.type === 'USER_GROUP').map((i) => i.value);
        await SpaceConnector.clientV2.alertManager.service.changeMember<ServiceChangeMembersParameters>({
            service_id: storeState.serviceInfo.service_id,
            members: {
                USER: selectedWorkspaceMemberList,
                USER_GROUP: selectedUserGroupList,
            },
        });
        await serviceDetailPageStore.fetchServiceDetailData(storeState.serviceInfo.service_id);
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
        state.mode = 'member';
    }
};
const handleClose = () => {
    state.proxyVisible = false;
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
                                <p-button style-type="tertiary"
                                          icon-left="ic_plus_bold"
                                          class="ml-auto"
                                          @click="handleClickInviteButton"
                                >
                                    {{ $t('ALERT_MANAGER.SERVICE.INVITE') }}
                                </p-button>
                            </p-field-group>
                            <div>
                                <div v-for="(item, idx) in state.memberList"
                                     :key="`member-item-${idx}`"
                                     class="flex items-center justify-between p-2 text-label-md"
                                >
                                    <p class="member-info-content">
                                        <img v-if="item.type === MEMBERS_TYPE.USER"
                                             :src="useRoleFormatter(item?.roleType || ROLE_TYPE.USER).image"
                                             alt="Role Type Icon"
                                             class="role-image inline"
                                        >
                                        <p-avatar v-else
                                                  class="menu-icon"
                                                  icon="ic_member"
                                                  :color="indigo[300]"
                                                  size="sm"
                                        />
                                        <span>{{ item.label }}</span>
                                    </p>
                                    <p class="member-info-content">
                                        <span v-if="item.type === MEMBERS_TYPE.USER"
                                              class="text-gray-500"
                                        >
                                            {{ item?.roleType }}
                                        </span>
                                        <p-icon-button name="ic_delete"
                                                       size="sm"
                                                       @click="handleRemoveMember(item.key)"
                                        />
                                    </p>
                                </div>
                            </div>
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
                                          :selected-ids.sync="state.selectedMemberItems"
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
