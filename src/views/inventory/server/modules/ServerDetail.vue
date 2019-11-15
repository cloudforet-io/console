<template>
    <div>
        <p-info-panel info-title="Base Information" :defs="baseDefs" :item="item">
            <template #def-state-format="scope">
                <p-status
                    icon="fa-circle"
                    icon-style="solid"
                    size="xs"
                    v-bind="serverStateBind(scope.value)"
                />
            </template>
            <template #def-core-format="scope">
                {{ scope.item.data.base.core }}
            </template>
            <template #def-menory-format="scope">
                {{ scope.item.data.base.memory }}
            </template>
            <template #def-fqdn-format="scope">
                {{ scope.item.data.domain }}
            </template>
            <template #def-os_distro-format="scope">
                {{ scope.item.data.os.os_distro }}
            </template>
            <template #def-os_detail-format="scope">
                {{ scope.item.data.os.os_distro }}
            </template>
            <template #def-region-format="scope">
                {{ scope.item.region_info.region_id }}
            </template>
            <template #def-oArch-format="scope">
                {{ scope.item.data.os.os_arch }}
            </template>
            <template #def-zone-format="scope">
                {{ scope.item.zone_info.zone_id }}
            </template>
            <template #def-kernel-format="scope">
                {{ scope.item.data.base.kernel }}
            </template>
            <template #def-pool-format="scope">
                {{ scope.item.pool_info.pool_id }}
            </template>
            <template #def-created_at-format="scope">
                {{ timestampFormatter(scope.value) }}
            </template>
            <template #def-updated_at-format="scope">
                {{ timestampFormatter(scope.value) }}
            </template>
            <template #def-deleted_at-format="scope">
                {{ timestampFormatter(scope.value) }}
            </template>
        </p-info-panel>
        <p-info-panel info-title="VM" :defs="vmDefs" :item="getVm">
            <template #def-platform_type-format="scope">
                <p-badge style-type="primary">
                    {{ scope.value }}
                </p-badge>
            </template>
        </p-info-panel>
        <p-info-panel info-title="Compute" :defs="computeDefs" :item="getCompute" />
        <p-tag-panel ref="tagPanel" :tags.sync="tags" @confirm="confirm" />
    </div>
</template>

<script>
import { computed, ref } from '@vue/composition-api';
import PInfoPanel from '@/components/organisms/panels/info-panel/InfoPanel';
import PTagPanel from '@/components/organisms/panels/tag-panel/TagPanel';
import PBadge from '@/components/atoms/badges/Badge';
import PStatus from '@/components/molecules/status/Status';
import { makeByPass, makeProxy } from '@/lib/compostion-util';
import { makeTrDefs } from '@/components/molecules/panel/panel-content/PanelContent.uitl';
import { timestampFormatter } from '@/lib/formatter';
import { serverStateBind } from '@/views/inventory/server/Server.util';

export default {
    name: 'PServerDetail',
    components: {
        PInfoPanel, PTagPanel, PBadge, PStatus,
    },
    props: {
        item: {
            type: Object,
            default: () => {},
        },
    },
    setup(props, { emit, parent }) {
        const baseDefs = makeTrDefs([
            ['server_id', 'COMMON.SERVER_ID'],
            ['name', 'COMMON.NAME'],
            ['state', 'COMMON.STATE'],
            ['primary_ip_address', 'COMMON.PRI_IP'],
            ['server_type', 'COMMON.SE_TYPE'],
            ['core', 'COMMON.CORE'],
            ['fqdn', 'COMMON.FQDN'],
            ['menory', 'COMMON.MEMORY'],
            ['os_type', 'COMMON.O_TYPE'],
            ['os_distro', 'COMMON.O_DIS'],
            ['project_id', 'COMMON.PROJ'],
            ['os_detail', 'COMMON.O_DETAIL'],
            ['region', 'COMMON.REGION'],
            ['oArch', 'COMMON.O_ARCH'],
            ['zone', 'COMMON.ZONE'],
            ['kernel', 'COMMON.KERNEL'],
            ['pool', 'COMMON.POOL'],
            ['booted_at', 'COMMON.LT_BOOT'],
            ['created_at', 'COMMON.CREATE'],
            ['updated_at', 'COMMON.UPDATE'],
            ['deleted_at', 'COMMON.DELETE'],
        ], parent, { copyFlag: true });
        const vmDefs = makeTrDefs([
            ['vm_id', 'COMMON.ID'],
            ['vm_name', 'COMMON.NAME'],
            ['platform_type', 'COMMON.PLATFORM'],
            ['image', 'COMMON.IMAGE'],
        ], parent, { copyFlag: true });
        const computeDefs = makeTrDefs([
            ['instance_id', 'COMMON.INST_ID'],
            ['keypair', 'COMMON.KEY_PAIR'],
            ['instance_type', 'COMMON.INST_TYPE'],
            ['created_by_user_id', 'COMMON.CREATE_BY'],
            ['security_groups', 'COMMON.SEC_GROUP'],
        ], parent, { copyFlag: true });
        const tags = ref({ ...props.item.tags });
        const tagPanel = ref(null);

        return {
            baseDefs,
            vmDefs,
            computeDefs,
            tags,
            tagPanel,
            resetTag: () => {
                tagPanel.value.resetTag();
            },
            confirm: makeByPass(emit, 'confirm'),
            timestampFormatter,
            serverStateBind,
            getVm: computed(() => (props.item ? props.item.data.vm : {})),
            getCompute: computed(() => (props.item ? props.item.data.compute : {})),
        };
    },
};
</script>
