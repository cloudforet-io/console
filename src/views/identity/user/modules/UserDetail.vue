<template>
    <div>
        <p-info-panel info-title="Base Information" :defs="baseDefs" :item="item">
            <template #def-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)" />
            </template>
        </p-info-panel>

        <p-dict-panel :dict.sync="tagsApi.ts.syncState.dict"
                      :edit-mode.sync="tagsApi.ts.syncState.editMode"
                      v-on="tagsApi.ts.listeners"
        />
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
        PInfoPanel, PDictPanel, PStatus,
    },
    props: {
        item: {
            type: Object,
            default: () => {},
        },
        // todo: need confirm that this is good way - sinsky
        tagConfirmEvent: String,
        tagResetEvent: String,
    },
    setup(props, { parent }) {
        const baseDefs = makeTrItems([
            ['user_id', 'COMMON.ID'],
            ['name', 'COMMON.NAME'],
            ['email', 'COMMON.EMAIL'],
            ['state', 'COMMON.STATE'],
            ['mobile', 'COMMON.PHONE', { sortable: false }],
            ['group', 'COMMON.GROUP'],
            ['language', 'COMMON.LANGUAGE'],
            ['domain_id', 'COMMON.DOMAIN_ID'],
            ['timezone', 'COMMON.TIMEZONE'],
        ], parent, { copyFlag: true });

        const tagsApi = new DictPanelAPI(fluentApi.identity().user());

        watch(() => props.item, async (item) => {
            tagsApi.setId(item.user_id);
            tagsApi.ts.toReadMode();
            await tagsApi.getData();
        });

        return {
            baseDefs,
            userStateFormatter,
            timestampFormatter,
            arrayFormatter,
            tagsApi,
        };
    },
};
</script>
