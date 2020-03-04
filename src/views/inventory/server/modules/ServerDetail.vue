<template>
    <div>
        <p-panel-top>Base Information</p-panel-top>
        <p-dynamic-view view_type="item" :data="item||{}"
                        :data_source="baseDataSource" :root-mode="true"
        />
        <p-dynamic-details :details="item.metadata.details" :data="item||{}" />
        <p-dict-panel ref="dictPanel" :dict.sync="dict" @confirm="confirm" />
    </div>
</template>

<script>
/* eslint-disable camelcase */

import { ref, watch } from '@vue/composition-api';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel_origin.vue';
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
            default: () => {},
        },
        // todo: need confirm that this is good way - sinsky
        tagConfirmEvent: String,
        tagResetEvent: String,
    },
    setup(props, { parent }) {
        const baseDataSource = [
            { name: 'ID', key: 'server_id' },
            { name: 'Name', key: 'name' },
            {
                name: 'State',
                key: 'state',
                view_type: 'enum',
                view_option: {
                    INSERVICE: {
                        view_type: 'state',
                        view_option: {
                            text_color: '#222532',
                            icon: {
                                color: '#60B731',
                            },
                        },
                    },
                    PENDING: {
                        view_type: 'state',
                        view_option: {
                            text_color: '#222532',
                            icon: {
                                color: '#FF7750',
                            },
                        },
                    },
                    MAINTENANCE: {
                        view_type: 'state',
                        view_option: {
                            text_color: '#222532',
                            icon: {
                                color: '#FFCE02',
                            },
                        },
                    },
                    CLOSED: {
                        view_type: 'state',
                        view_option: {
                            text_color: '#EF3817',
                            icon: {
                                color: '#EF3817',
                            },
                        },
                    },
                    DELETED: {
                        view_type: 'state',
                        view_option: {
                            text_color: '#858895',
                            icon: {
                                color: '#858895',
                            },
                        },
                    },
                },
            },
            { name: 'Primary IP', key: 'primary_ip_address' },
            { name: 'Server Type', key: 'server_type' },
            { name: 'OS Type', key: 'os_type' },
            { name: 'Project', key: 'project' },
            { name: 'Region', key: 'region_info.region_id' },
            { name: 'Zone', key: 'zone_info.zone_id' },
            { name: 'Pool', key: 'pool_info.pool_id' },
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
                name: 'Updated at',
                key: 'updated_at.seconds',
                view_type: 'datetime',
                view_option: {
                    source_type: 'timestamp',
                    source_format: 'seconds',
                },
            },
            {
                name: 'Deleted at',
                key: 'deleted_at.seconds',
                view_type: 'datetime',
                view_option: {
                    source_type: 'timestamp',
                    source_format: 'seconds',
                },
            },
        ];
        const dict = ref({ ...props.item.tags });
        watch(() => props.item, (value) => {
            if (value) {
                dict.value = value.tags || {};
            }
        });
        const dictPanel = ref(null);
        const resetTag = () => {
            dictPanel.value.reset();
        };
        mountBusEvent(ServerEventBus, props.tagResetEvent, resetTag);

        return {
            baseDataSource,
            dict,
            dictPanel,
            confirm(...event) {
                ServerEventBus.$emit(props.tagConfirmEvent, props.item.server_id, ...event);
            },
        };
    },
};
</script>
