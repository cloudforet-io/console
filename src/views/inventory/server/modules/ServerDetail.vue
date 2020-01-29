<template>
    <div>
        <p-dynamic-view name="Base Information" view_type="item" :data="item||{}"
                        :data_source="baseDataSource" :root-mode="true"
        />
        <p-dynamic-view name="VM" view_type="item" :data="item.data||{}"
                        :data_source="vmDataSource"
        />
        <p-dynamic-view name="Compute" view_type="item" :data="item.data||{}"
                        :data_source="computeDataSource"
        />
        <p-dict-panel ref="dictPanel" :dict.sync="dict" @confirm="confirm" />
    </div>
</template>

<script>
/* eslint-disable camelcase */

import { ref, watch } from '@vue/composition-api';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import ServerEventBus from '@/views/inventory/server/ServerEventBus';
import { mountBusEvent } from '@/lib/compostion-util';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';

export default {
    name: 'PServerDetail',
    components: {
        PDictPanel, PDynamicView,
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
            { name: 'Core', key: 'data.base.core' },
            { name: 'FQDN', key: 'data.domain' },
            { name: 'Memory', key: 'data.base.memory' },
            { name: 'OS Type', key: 'os_type' },
            { name: 'OS Distro', key: 'data.os.os_distro' },
            { name: 'Project', key: 'project' },
            { name: 'OS Details', key: 'os_detail' },
            { name: 'Region', key: 'region_info.region_id' },
            { name: 'OS Architecture', key: 'data.os.os_arch' },
            { name: 'Zone', key: 'zone_info.zone_id' },
            { name: 'Kernel', key: 'data.base.kernel' },
            { name: 'Pool', key: 'pool_info.pool_id' },
            { name: 'Last Boot Time', key: 'booted_at' },
            {
                name: 'Created at',
                key: 'created_at.seconds',
                view_type: 'datetime',
                view_option: {
                    source_type: 'timestamp',
                    source_format: 'seconds',
                    display_format: 'YYYY-MM-DD HH:MM:SS z',
                },
            },
            {
                name: 'Updated at',
                key: 'updated_at.seconds',
                view_type: 'datetime',
                view_option: {
                    source_type: 'timestamp',
                    source_format: 'seconds',
                    display_format: 'YYYY-MM-DD HH:MM:SS z',
                },
            },
            {
                name: 'Deleted at',
                key: 'deleted_at.seconds',
                view_type: 'datetime',
                view_option: {
                    source_type: 'timestamp',
                    source_format: 'seconds',
                    display_format: 'YYYY-MM-DD HH:MM:SS z',
                },
            },
        ];
        const vmDataSource = [
            { name: 'ID', key: 'data.vm.vm_id' },
            { name: 'Name', key: 'data.vm.vm_name' },
            {
                name: 'Platform',
                key: 'data.vm.platform_type',
                view_type: 'enum',
                view_option: {
                    AWS: {
                        view_type: 'badge',
                        view_option: {
                            text_color: 'white',
                            background_color: '#FFCE02',
                        },
                    },
                    GCP: {
                        view_type: 'badge',
                        view_option: {
                            text_color: 'white',
                            background_color: '#60B731',
                        },
                    },
                    AZURE: {
                        view_type: 'badge',
                        view_option: {
                            text_color: 'white',
                            background_color: '#0080FB',
                        },
                    },
                    OPENSTACK: {
                        view_type: 'badge',
                        view_option: {
                            text_color: 'white',
                            background_color: '#EF3817',
                        },
                    },
                },

            },
            { name: 'Image', key: 'data.vm.image' },
        ];
        const computeDataSource = [
            { name: 'Instance ID', key: 'data.compute.instance_id' },
            { name: 'Key Pair', key: 'data.compute.keypair' },
            { name: 'Instance Type', key: 'data.compute.instance_type' },
            { name: 'Created By', key: 'data.compute.created_by_user_id' },
            {
                name: 'Security Group',
                key: 'data.compute.security_groups',
                view_type: 'list',
                view_option: {
                    item: {
                        view_type: 'text',
                    },
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
            vmDataSource,
            computeDataSource,
            dict,
            dictPanel,
            confirm(...event) {
                ServerEventBus.$emit(props.tagConfirmEvent, props.item.server_id, ...event);
            },
        };
    },
};
</script>
