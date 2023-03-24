<template>
    <div class="notice-page">
        <p-heading :title="$t('INFO.NOTICE.MAIN.NOTICE_TITLE')">
            <template #extra>
                <p-button v-if="hasDomainRoleUser || hasSystemRoleUser"
                          style-type="secondary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateNotice"
                >
                    {{ $t('INFO.NOTICE.FORM.CREATE_NOTICE') }}
                </p-button>
            </template>
        </p-heading>
        <notice-list />
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import {
    PButton, PHeading,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import NoticeList from '@/services/info/notice/modules/NoticeList.vue';
import { INFO_ROUTE } from '@/services/info/route-config';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';

export default {
    name: 'NoticePage',
    components: {
        PHeading,
        PButton,
        NoticeList,
    },
    setup() {
        const state = reactive({
            hasDomainRoleUser: computed(() => store.getters['user/hasDomainRole']),
            hasSystemRoleUser: computed(() => store.getters['user/hasSystemRole']),
        });
        const handleCreateNotice = () => {
            SpaceRouter.router.push({ name: INFO_ROUTE.NOTICE.CREATE._NAME });
        };

        return {
            ...toRefs(state),
            MY_PAGE_ROUTE,
            handleCreateNotice,
        };
    },
};
</script>
