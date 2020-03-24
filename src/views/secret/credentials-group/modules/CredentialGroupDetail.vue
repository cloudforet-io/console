<template>
    <div>
        <p-panel-top>Base Information</p-panel-top>
        <p-dynamic-view name="Base Information" view_type="item" :data="item||{}"
                        :data_source="baseDataSource" :root-mode="true"
        />
        <p-dict-panel :dict.sync="tagsApi.ts.syncState.dict"
                      :edit-mode.sync="tagsApi.ts.syncState.editMode"
                      v-on="tagsApi.ts.listeners"
        />
    </div>
</template>

<script>
/* eslint-disable camelcase */
import { ref, watch } from '@vue/composition-api';
import { DictPanelAPI } from '@/components/organisms/panels/dict-panel/dict';
import { fluentApi } from '@/lib/fluent-api';

import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';

export default {
    name: 'PCdgDetail',
    components: {
        PDictPanel, PDynamicView, PPanelTop,
    },
    props: {
        item: {
            type: Object,
            default: () => {},
        },
        tagConfirmEvent: String,
        tagResetEvent: String,
    },
    setup(props, { parent }) {
        const baseDataSource = [
            { name: 'ID', key: 'credential_group_id' },
            { name: 'Name', key: 'name' },
            {
                name: 'Created at',
                key: 'created_at.seconds',
                view_type: 'datetime',
                view_option: {
                    source_type: 'timestamp',
                    source_format: 'seconds',
                },
            },
        ];


        const tagsApi = new DictPanelAPI(fluentApi.secret().secretGroup());

        watch(() => props.item, async (item) => {
            tagsApi.setId(item.credential_group_id);
            tagsApi.ts.toReadMode();
            await tagsApi.getData();
        });

        return {
            baseDataSource,
            tagsApi,
        };
    },
};
</script>
