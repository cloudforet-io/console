<template>
    <li class="list-item">
        <div class="title">
            <p-i v-if="isPinned" class="pin" name="ic_pin"
                 width="1.125rem"
            />
            <text-highlighting class="title" :term="inputText" :text="title" />
            <new-mark v-if="isNew" class="new-mark" />
        </div>
        <div class="info">
            <p-badge outline :style-type="noticeTypeBadge.style">
                {{ noticeTypeBadge.label }}
            </p-badge><span>date</span><p-i width="0.125rem" name="ic_divider-dot" />
            <span>writer</span><p-i v-if="hasDomainRoleUser" width="0.125rem" name="ic_divider-dot" />
            <span v-if="hasDomainRoleUser" class="view-count"><p-i name="ic_view" width="1.125rem" /> 1,234</span>
        </div>
    </li>
</template>

<script lang="ts">
import type { PropType } from '@vue/composition-api';
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';

import { PBadge, PI } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';


import NewMark from '@/common/components/marks/NewMark.vue';
import TextHighlighting from '@/common/components/text/text-highlighting/TextHighlighting.vue';

import type { NoticeType } from '@/services/my-page/notice/config';
import { NOTICE_TYPE } from '@/services/my-page/notice/config';

interface Props {
    title: string;
    noticeType: string;
    inputText: string;
    isNew: boolean;
    isPinned: boolean;
}

export default defineComponent<Props>({
    name: 'ListItem',
    components: {
        PBadge,
        PI,
        NewMark,
        TextHighlighting,
    },
    props: {
        title: {
            type: String,
            default: '',
        },
        noticeType: {
            type: String as PropType<NoticeType>,
            default: '',
        },
        inputText: {
            type: String,
            default: '',
        },
        isNew: {
            type: Boolean,
            default: false,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            // song-lang
            noticeTypeBadge: computed(() => {
                switch (props.noticeType) {
                case NOTICE_TYPE.SYSTEM:
                    return {
                        label: i18n.t('시스템 공지'),
                        style: 'primary',
                    };
                case NOTICE_TYPE.DOMAIN:
                    return {
                        label: i18n.t('내부 공지'),
                        style: 'gray',
                    };
                default: return '';
                }
            }),
            hasDomainRoleUser: computed(() => store.getters['user/hasDomainRole']),
        });
        return {
            ...toRefs(state),
        };
    },
});
</script>

<style scoped lang="postcss">
.list-item {
    @apply border-b border-gray-200;
    padding: 1rem;

    @media (hover: hover) {
        &:hover {
            @apply bg-blue-100;
        }
    }
}
.list-item:last-child {
    @apply border-b-0;
}
.title {
    margin-bottom: 0.375rem;
    vertical-align: baseline;
    .pin {
        margin-right: 0.125rem;
        margin-bottom: 0.1875rem;
    }
    .title {
        @apply text-gray-900 font-bold;
        line-height: 1.25;
    }
    .new-mark {
        display: inline-block;
        margin-top: 0.1875rem;
    }
}
.info {
    @apply flex flex-wrap gap-2 items-center text-gray-600;
    font-size: 0.875rem;
    line-height: 1.25;
    .view-count {
        @apply flex items-center;
        gap: 0.125rem;
    }
}
</style>
