<template>
    <fragment>
        <notice-popup-item
            v-for="(item, index) in popupList"
            :key="`notice-item-${index}`"
            :popup-index="index"
        />
    </fragment>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

import NoticePopupItem from '@/common/modules/popup/notice/modules/NoticePopupItem.vue';

export default {
    name: 'NoticePopup',
    components: {
        NoticePopupItem,
    },
    setup() {
        const state = reactive({
            popupList: [0, 1, 2],
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
