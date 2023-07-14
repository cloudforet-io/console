<script lang="ts" setup>
import {
    PButton, PHeading,
} from '@spaceone/design-system';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import NoticeList from '@/services/info/notice/modules/NoticeList.vue';
import { INFO_ROUTE } from '@/services/info/route-config';



const store = useStore();
const router = useRouter();
const { t } = useI18n();

const state = reactive({
    hasDomainRoleUser: computed(() => store.getters['user/hasDomainRole']),
    hasSystemRoleUser: computed(() => store.getters['user/hasSystemRole']),
});
const handleCreateNotice = () => {
    router.push({ name: INFO_ROUTE.NOTICE.CREATE._NAME });
};

</script>

<template>
    <div class="notice-page">
        <p-heading :title="t('INFO.NOTICE.MAIN.NOTICE_TITLE')">
            <template #extra>
                <p-button v-if="state.hasDomainRoleUser || state.hasSystemRoleUser"
                          style-type="secondary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateNotice"
                >
                    {{ t('INFO.NOTICE.FORM.CREATE_NOTICE') }}
                </p-button>
            </template>
        </p-heading>
        <notice-list />
    </div>
</template>
