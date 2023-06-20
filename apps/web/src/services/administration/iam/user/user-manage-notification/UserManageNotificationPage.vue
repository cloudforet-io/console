<script lang="ts" setup>
import { PBreadcrumbs, PHeading } from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import NotificationChannelList from '@/services/notification/modules/NotificationChannelList.vue';


const store = useStore();
const { t } = useI18n();
const router = useRouter();

const state = reactive({
    isManageable: computed(() => store.getters['user/isDomainOwner'] || store.getters['user/hasDomainRole']),
});
const routeState = reactive({
    routes: computed(() => ([
        { name: 'Administration', to: { name: ADMINISTRATION_ROUTE._NAME } },
        { name: 'IAM', to: { name: ADMINISTRATION_ROUTE.IAM._NAME } },
        { name: 'User Management', to: { name: ADMINISTRATION_ROUTE.IAM.USER._NAME } },
        { name: t('IDENTITY.USER.NOTIFICATION.MANAGE_CHANNEL') },
    ])),
});
const goToUserManagement = () => {
    router.push({ name: ADMINISTRATION_ROUTE.IAM.USER._NAME });
};

</script>

<template>
    <div class="manage-notification-page">
        <p-breadcrumbs class="flex-grow"
                       :routes="routeState.routes"
        />
        <p-heading show-back-button
                   :title="t('IDENTITY.USER.MAIN.NOTIFICATION')"
                   @click-back-button="goToUserManagement"
        />
        <notification-channel-list :manage-disabled="!state.isManageable" />
    </div>
</template>
