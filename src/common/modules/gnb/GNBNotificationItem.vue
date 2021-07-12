<template>
    <div class="notification-item">
        <g-n-b-notification-date-header v-if="dateHeader" :datetime="dateHeader" />
        <div class="item-wrapper" :class="{'link-hover': isLinkMouseEntered}">
            <new-mark v-if="isNew" class="new-mark" />
            <div class="contents-wrapper">
                <p class="title">
                    <p-i name="ic_state_duplicated" width="1rem" height="1rem"
                         class="mr-1"
                    />
                    <span>Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet, consectetur</span>
                </p>
                <p-anchor :class="{collapsed: isCollapsed, 'no-link': !link}"
                          :href="link" target="_self"
                          :show-icon="false"
                          :highlight="!!link"
                          @mouseenter.native="link ? changeLinkMouseEnterState(true) : undefined"
                          @mouseleave.native="link ? changeLinkMouseEnterState(false) : undefined"
                >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.
                    [contents] Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                    [contents] Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                    [contents] Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                    [contents] Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do. Lorem ipsum sit amet
                </p-anchor>
                <p-collapsible-toggle v-model="isCollapsed" />
                <div class="datetime">
                    2020-06-03 10:19
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { PCollapsibleToggle, PI, PAnchor } from '@spaceone/design-system';
import NewMark from '@/common/components/marks/NewMark.vue';
import { reactive, toRefs } from '@vue/composition-api';
import GNBNotificationDateHeader from '@/common/modules/gnb/GNBNotificationDateHeader.vue';

export default {
    name: 'GNBNotificationItem',
    components: {
        GNBNotificationDateHeader,
        NewMark,
        PI,
        PAnchor,
        PCollapsibleToggle,
    },
    props: {
        dateHeader: {
            type: String,
            default: '',
        },
        isNew: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
            default: '',
        },
    },
    setup() {
        const state = reactive({
            isLinkMouseEntered: false,
            isCollapsed: true,
        });
        const changeLinkMouseEnterState = (value: boolean) => {
            if (state.isLinkMouseEntered !== value) state.isLinkMouseEntered = value;
        };
        return {
            ...toRefs(state),
            changeLinkMouseEnterState,
        };
    },
};
</script>

<style lang="postcss" scoped>
.notification-item {
    .item-wrapper {
        @apply rounded-lg;
        display: flex;
        padding: 0.5rem;
        align-items: baseline;
        &.link-hover {
            @apply bg-violet-100;
        }
        .new-mark {
            flex-shrink: 0;
            margin-right: 0.25rem;
            margin-left: 0;
            line-height: 1.2;
        }
        .contents-wrapper {
            flex-grow: 1;
        }
        .p-anchor::v-deep {
            display: inline-block;
            font-size: 0.875rem;
            margin-bottom: 0.125rem;
            .text {
                display: -webkit-box;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                line-height: 1.5rem;
                word-break: break-word;
            }
            &.collapsed {
                .text {
                    -webkit-line-clamp: 3;
                }
            }
            &.no-link:hover {
                cursor: unset;
                .text {
                    text-decoration: none;
                }
            }
        }
        .title {
            font-size: 0.875rem;
            line-height: 1.5;
            font-weight: bold;
            text-transform: capitalize;
            vertical-align: middle;
            margin-bottom: 0.125rem;
        }
        .datetime {
            @apply text-gray-400;
            margin-top: 0.125rem;
            font-size: 0.75rem;
            line-height: 1.5;
        }
    }
}
</style>
