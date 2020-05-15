<template>
    <div>
        <p-info-panel info-title="Base Information" :defs="baseDefs" :item="item">
            <template #def-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)" />
            </template>
        </p-info-panel>
    </div>
</template>

<script>
import { ref, watch } from '@vue/composition-api';
import { DictPanelAPI } from '@/lib/api/dict';
import { fluentApi } from '@/lib/fluent-api';

import PInfoPanel from '@/components/organisms/panels/info-panel/InfoPanel.vue';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import PStatus from '@/components/molecules/status/Status.vue';
import { timestampFormatter, arrayFormatter, userStateFormatter } from '@/lib/util';
import { mountBusEvent } from '@/lib/compostion-util';
import { makeTrItems } from '@/lib/view-helper';
import userEventBus from '@/views/identity/user/UserEventBus';

export default {
    name: 'PUserDetail',
    components: {
        PInfoPanel, PStatus,
    },
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },

    },
    setup(props, { parent }) {
        const baseDefs = makeTrItems([
            ['user_id', 'COMMON.USER_ID'],
            ['name', 'COMMON.NAME'],
            ['email', 'COMMON.EMAIL'],
            ['state', 'COMMON.STATE'],
            ['mobile', 'COMMON.PHONE', { sortable: false }],
            ['group', 'COMMON.GROUP'],
            ['language', 'COMMON.LANGUAGE'],
            ['domain_id', 'COMMON.DOMAIN_ID'],
            ['timezone', 'COMMON.TIMEZONE'],
        ], parent, { copyFlag: true });


        return {
            baseDefs,
            userStateFormatter,
            timestampFormatter,
            arrayFormatter,
        };
    },
};
</script>
