<template>
    <div>
        <p-panel-top>Base Information</p-panel-top>
        <p-definition-table :items="defs">
            <template #data-created_at="{data}">
                {{ data ? timestampFormatter(data) : '' }}
            </template>
        </p-definition-table>
        <p-dict-panel :dict.sync="tagsApi.ts.syncState.dict"
                      :edit-mode.sync="tagsApi.ts.syncState.editMode"
                      v-on="tagsApi.ts.listeners"
        />
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import { computed, watch } from '@vue/composition-api';
import { DictPanelAPI } from '@/lib/api/dict';
import { fluentApi } from '@/lib/fluent-api';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import { makeDefItems } from '@/components/organisms/tables/definition-table/PDefinitionTable.toolset';
import { timestampFormatter } from '@/lib/util';

export default {
    name: 'PCredentialsDetail',
    components: {
        PDefinitionTable,
        PDictPanel,
        PPanelTop,
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
        const tagsApi = new DictPanelAPI(fluentApi.secret().secret());

        const defs = computed(() => {
            return makeDefItems([
                { label: 'ID', name: 'secret_id' },
                { label: 'Name', name: 'name' },
                { label: 'Secret Type', name: 'secret_type' },
                { label: 'Created at', name: 'created_at' },
            ], props.item);
        });

        watch(() => props.item, async (item) => {
            tagsApi.setId(item.secret_id);
            tagsApi.ts.toReadMode();
            await tagsApi.getData();
        });

        return {
            tagsApi,
            defs,
            timestampFormatter,
        };
    },
};
</script>
