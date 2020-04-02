<template>
    <div>
        <!--        <p-info-panel info-title="Base Information" :defs="baseDefs" :item="item">-->
        <!--            <template #def-created_at-format="data">-->
        <!--                {{ timestampFormatter(data.value) }}-->
        <!--            </template>-->
        <!--            <template #def-credential_group_id-format="{item}">-->
        <!--                <div>-->
        <!--                    <PBadge v-for="(label, idx) in item.credential_groups" :key="idx" class="p-label"-->
        <!--                            style-type="gray200"-->
        <!--                    >-->
        <!--                        {{ getEmptyString(label.name) }}-->
        <!--                    </PBadge>-->
        <!--                </div>-->
        <!--            </template>-->
        <!--        </p-info-panel>-->
        <p-panel-top>Base Information</p-panel-top>
        <p-dynamic-view name="Base Information" view_type="item" :data="item||{}"
                        :data_source="baseDataSource"
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
import credentialsEventBus from '@/views/secret/credentials/CredentialsEventBus';

export default {
    name: 'PCredentialsDetail',
    components: {
        PDictPanel, PDynamicView, PPanelTop,
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
        const baseDataSource = [
            { name: 'ID', key: 'credential_id' },
            { name: 'name', key: 'name' },
            { name: 'issue_type', key: 'issue_type' },
            {
                name: 'Created at',
                key: 'created_at.seconds',
                view_type: 'datetime',
                view_option: {
                    source_type: 'timestamp',
                    source_format: 'seconds',
                },
            },
            {
                name: 'Group',
                key: 'credential_groups',
                view_type: 'list',
                view_option: {
                    sub_key: 'name',
                    delimiter: ' ',
                    item: {
                        view_type: 'badge',
                        view_option: {
                            text_color: '#222532',
                            background_color: '#DCDDE2',
                        },
                    },
                },
            },
        ];

        const tagsApi = new DictPanelAPI(fluentApi.secret().secret());

        watch(() => props.item, async (item) => {
            tagsApi.setId(item.credential_id);
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
