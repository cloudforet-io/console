<template>
    <div class="notice-page">
        <!--song-lang-->
        <p-page-title :title="$t('Notice')">
            <template #extra>
                <p-button :outline="true" style-type="primary-dark" icon="ic_plus_bold">
                    <!--song-lang-->
                    {{ $t('Create Notice') }}
                </p-button>
            </template>
        </p-page-title>
        <notice-list :notice-items="noticeItems" :loading="false">
            <template #header>
                <div class="notice-header">
                    header
                </div>
            </template>
        </notice-list>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import {
    PButton, PPageTitle,
} from '@spaceone/design-system';

import NoticeList from '@/services/my-page/notice/modules/NoticeList.vue';

export default {
    name: 'NoticePage',
    components: {
        PPageTitle,
        PButton,
        NoticeList,
    },
    setup() {
        const state = reactive({
            noticeItems: [
                {
                    title: 'title1',
                    type: 'type1',
                    createdAt: 'createdAt1',
                },
                {
                    title: 'title2',
                    type: 'type2',
                    createdAt: 'createdAt2',
                },
                {
                    title: 'title3',
                    type: 'type3',
                    createdAt: 'createdAt3',
                },
            ],
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>
