<template>
    <div class="notice-page">
        <!--song-lang-->
        <p-page-title :title="$t('Notice')">
            <template #extra>
                <p-button :outline="true" style-type="primary-dark" icon="ic_plus_bold"
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
import {
    PButton, PPageTitle,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

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
        const handleCreateNotice = () => {
            SpaceRouter.router.push({ name: INFO_ROUTE.NOTICE.CREATE._NAME });
        };

        return {
            MY_PAGE_ROUTE,
            handleCreateNotice,
        };
    },
};
</script>
