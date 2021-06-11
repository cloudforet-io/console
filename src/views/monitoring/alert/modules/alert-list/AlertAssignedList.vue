<template>
    <p-list-card
        :items="listItems"
        class="assigned-alert-list"
        style-type="indigo400"
    >
        <template #header>
            <p-i name="ic_notification" width="1.25rem" height="1.25rem"
                 class="ic_notification"
                 color="white"
            />
            {{ $t('MONITORING.ALERT.ALERT_LIST.ASSIGNED_TO_YOU_TITLE') }}
            <p-i name="ic_delete" width="1.25rem" height="1.25rem"
                 class="ic_delete cursor-pointer"
                 color="inherit"
            />
        </template>
        <template #item="{item, index}">
            <!--            <alert-list-item :item="item" />-->
        </template>
    </p-list-card>
</template>
<script lang="ts">
import {
    PListCard, PI,
} from '@spaceone/design-system';
import AlertListItem from '@/views/monitoring/alert/components/AlertListItem.vue';
import { reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'AlertAssignedList',
    components: {
        AlertListItem,
        PListCard,
        PI,
    },
    setup() {
        const state = reactive({
            // listItems: [
            //     {
            //         value: 'Netsparker Enterprise Test Issue',
            //         icon: 'ic_alert',
            //         project: 'Group > Project',
            //         badge: 'acknowledged',
            //         date: '05/17 17:04',
            //     },
            //     {
            //         value: 'Vulnerability - Local File Inclusion',
            //         icon: 'ic_state_duplicated',
            //         project: 'Group > Project',
            //         badge: 'triggered',
            //         date: '05/17 17:06',
            //     },
            //     {
            //         value: 'Netsparker Enterprise Test Issue. Netsparker Enterprise Test Issue.',
            //         icon: 'ic_alert',
            //         project: 'Group > Project',
            //         badge: 'acknowledged',
            //         date: '05/17 17:04',
            //     },
            // ],
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
<style lang="postcss" scoped>
.assigned-alert-list::v-deep {
    @apply col-span-12;
    header {
        @apply flex items-center;

        .ic_notification {
            @apply inline-block;
            margin-right: 0.25rem;
        }
        .ic_delete {
            @apply ml-auto;
        }
    }
}
</style>
