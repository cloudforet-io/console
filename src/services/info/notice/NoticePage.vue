<template>
    <div class="notice-page">
        <!--song-lang-->
        <p-page-title :title="$t('Notice')">
            <template #extra>
                <p-button v-if="hasDomainRoleUser || hasSystemRoleUser" :outline="true" style-type="primary-dark"
                          icon="ic_plus_bold"
                          @click="handleCreateNotice"
                >
                    <!--song-lang-->
                    {{ $t('Create Notice') }}
                </p-button>
            </template>
        </p-page-title>
        <notice-list />
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PButton, PPageTitle,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import NoticeList from '@/services/info/notice/modules/NoticeList.vue';
import { INFO_ROUTE } from '@/services/info/route-config';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';

export default {
    name: 'NoticePage',
    components: {
        PPageTitle,
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
