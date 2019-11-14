<template>
    <div>
        <p-info-panel info-title="Base Information" />
        <p-info-panel info-title="VM" />
        <p-info-panel info-title="Compute" />
        <p-tag-panel :tags.sync="proxyTags" @confirm="confirm" />
    </div>
</template>

<script>
import { computed, onMounted, reactive } from '@vue/composition-api';
import PInfoPanel from '@/components/organisms/panels/info-panel/InfoPanel';
import PTagPanel from '@/components/organisms/panels/tag-panel/TagPanel';
import { makeByPass, makeProxy } from '@/lib/compostion-util';
import { makeReactiveTrDefs, makeTrDefs } from '@/components/molecules/panel/panel-content/PanelContent.uitl';

export default {
    name: 'PServerDetail',
    components: { PInfoPanel, PTagPanel },
    props: {
        item: {
            type: Object,
            default: () => {},
        },
        tags: {
            type: Object,
            default: () => {},
        },
    },
    setup(props, { emit, root }) {
        const item = reactive({
            vm: computed(() => props.item.data.vm),
          domain: computed(() => props.item.data.vm),
          vm: computed(() => props.item.data.vm),
          vm: computed(() => props.item.data.vm),
          vm: computed(() => props.item.data.vm),

        });
        const baseDefs = makeReactiveTrDefs([
            ['id', 'COMMON.SERVER_ID', props.item.server_id],
            ['name', 'COMMON.NAME', props.item.name],
            ['state', 'COMMON.STATE', props.item.state],
            ['priIp', 'COMMON.PRI_IP', props.item.primary_ip_address],
            ['serverType', 'COMMON.SE_TYPE', props.item.server_type],
            ['core', 'COMMON.CORE', props.item.data.base.core],
            ['fqdn', 'COMMON.FQDN', props.item.server_id],
            ['menory', 'COMMON.MEMORY', props.item.data.base.core],
            ['osType', 'COMMON.O_TYPE', props.item.os_type],
            ['oDis', 'COMMON.O_DIS', props.item.data.os.os_distro],
            ['project', 'COMMON.PROJ', props.item.project_id],
            ['oDetail', 'COMMON.O_DETAIL', ''],
            ['region', 'COMMON.REGION', props.item.server_id],
            ['oArch', 'COMMON.O_ARCH', props.item.server_id],
            ['zone', 'COMMON.ZONE', props.item.server_id],
            ['kernel', 'COMMON.KERNEL', props.item.server_id],
            ['pool', 'COMMON.POOL', props.item.server_id],
            ['ltBoot', 'COMMON.LT_BOOT', props.item.server_id],
            ['create', 'COMMON.CREATE', props.item.server_id],
            ['update', 'COMMON.UPDATE', props.item.server_id],
            ['delete', 'COMMON.DELETE', props.item.server_id],
        ], root);

        return {
            proxyTags: makeProxy('tags', props, emit),
            confirm: makeByPass(emit, 'confirm'),
        };
    },
};
</script>

<style scoped>

</style>
