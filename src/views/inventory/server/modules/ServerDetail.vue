<template>
    <div>
        <p-panel-top>Base Information</p-panel-top>
        <p-dynamic-view view_type="item" :data="item||{}"
                        :data_source="dataSource" :root-mode="true"
        />
        <p-dynamic-details :details="item.metadata.details" :data="item||{}" />
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
import {fluentApi} from '@/lib/fluent-api';

import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import ServerEventBus from '@/views/inventory/server/ServerEventBus';
import { mountBusEvent } from '@/lib/compostion-util';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';

export default {
    name: 'PServerDetail',
    components: {
        PDictPanel, PDynamicView, PDynamicDetails, PPanelTop,

    },
    props: {
        item: {
            type: Object,
            default: () =>({}),
        },
      dataSource:{
          type:Array,
            default:()=> []
      }
    },
    setup(props, { parent }) {

        const tagsApi = new DictPanelAPI(fluentApi.inventory().server());

        watch(() => props.item, async (item) => {
            tagsApi.setId(item.server_id);
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
