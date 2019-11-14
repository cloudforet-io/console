<template>
    <div>
        <BasePanel :panels="panelData"
                   @edit="showTagEditModal"
        />
        <BaseModal ref="IVSV002_TagEditModal"
                   :title="tr('TITLE', [tr('BTN_EDIT'), tr('TAG')])"
                   centered
                   size="md"
                   type="primary"
                   interactive
                   @ok="onEditTags"
                   @cancel="hideTagEditModal"
        >
            <template #contents>
                <BaseTag ref="IVSV002_Tags"
                         :tag-data="tags"
                         editable
                         align="between"
                />
            </template>
        </BaseModal>
    </div>
</template>

<script>
const BasePanel = () => import('@/components/base/panel/BasePanel');
const BaseModal = () => import('@/components/base/modal/BaseModal');
const BaseTag = () => import('@/components/base/tags/BaseTag');

export default {
    name: 'ServerSummary',
    components: {
        BasePanel,
        BaseModal,
        BaseTag,
    },
    props: {
        serverData: {
            type: Object,
            default: () => (server),
            required: true,
        },
    },
    data() {
        return {
            sampleNoticePanel: {
                header: {
                    headerIcon: {
                        icon: 'fa-exclamation-circle',
                        type: 'l',
                        size: 1,
                        color: 'primary',
                    },
                    text: '리눅스 정보 추가 수집 필요',
                },
                contents: [
                    { text: ' This is sample test' },
                    { text: '네트워크 ACL에서 SSH (TCP 22) 및 ICMP 포트 오픈 확인' },
                    { text: '클라우드 인스턴스 인 경우 Security Group 추가 확인' },
                    { text: '사내 LDAP 연동 또는 리눅스 계정(sdiadmin) 생성' },
                    { text: 'SUDO NOPASSWD 권한 설정' },
                    { text: 'Actions > Collect Info 버튼 클릭 후 Linux Collector 실행' },
                    { text: '리눅스 수집 실패 시 COMMAND 탭에서 로그 확인 (수집 실패 원인)\n' },
                ],
                footer: {
                    title: '수집 관련 문의:',
                    text: 'sdi-dev@ncsoft.com',
                },
            },
        };
    },
    computed: {
        os() {
            return this.serverData.data.os || {};
        },
        domain() {
            return this.serverData.data.domain || {};
        },
        vm() {
            return this.serverData.data.vm || {};
        },
        compute() {
            return this.serverData.data.compute || {};
        },
        // computeSecurityGroups () {
        //     return this.compute.security_groups ? this.compute.security_groups.toString() : '';
        // },
        poolInfo() {
            return this.serverData.pool_info || {};
        },
        base() {
            return this.serverData.data.base || {};
        },
        regionInfo() {
            return this.serverData.region_info || {};
        },
        zoneInfo() {
            return this.serverData.zone_info || {};
        },
        serverInfo() {
            return [
                { title: `${this.tr('COMMON.SERVER')} ${this.tr('COMMON.ID')}`, contents: this.serverData.server_id, copyFlag: true },
                { title: this.tr('COL_NM.NAME'), contents: this.serverData.name, copyFlag: true },
                {
                    title: this.tr('COL_NM.STATE'), state: this.serverData.state, stateType: 'SERVER_STATE', copyFlag: true,
                },
                { title: this.tr('COL_NM.PRI_IP'), contents: this.serverData.primary_ip_address, copyFlag: true },
                {
                    title: this.tr('COL_NM.SE_TYPE'), badge: this.serverData.server_type, badgeType: 'SERVER_TYPE', copyFlag: true,
                },
                { title: this.tr('COL_NM.CORE'), contents: this.base.core, copyFlag: true },
                { title: this.tr('COL_NM.FQDN'), contents: this.domain.fqdn, copyFlag: true },
                { title: this.tr('COL_NM.MEMORY'), contents: this.base.memory, copyFlag: true },
                { title: this.tr('COL_NM.O_TYPE'), contents: this.serverData.os_type, copyFlag: true },
                { title: this.tr('COL_NM.O_DIS'), contents: this.os.os_distro, copyFlag: true },
                { title: this.tr('COL_NM.PROJ'), contents: this.serverData.project_id, copyFlag: true },
                { title: this.tr('COL_NM.O_DETAIL'), contents: this.os.os_details, copyFlag: true },
                { title: this.tr('COL_NM.REGION'), contents: this.regionInfo.region_id, copyFlag: true },
                { title: this.tr('COL_NM.O_ARCH'), contents: this.os.os_arch, copyFlag: true },
                { title: this.tr('COL_NM.ZONE'), contents: this.zoneInfo.zone_id, copyFlag: true },
                { title: this.tr('COL_NM.KERNEL'), contents: this.base.kernel, copyFlag: true },
                { title: this.tr('COL_NM.POOL'), contents: this.poolInfo.pool_id, copyFlag: true },
                { title: this.tr('COL_NM.LT_BOOT'), contents: this.getDate(this.base.booted_at), copyFlag: true },
                { title: this.tr('COL_NM.CREATE'), contents: this.getDate(this.base.created_at), copyFlag: true },
                { title: this.tr('COL_NM.UPDATE'), contents: this.getDate(this.base.updated_at), copyFlag: true },
                { title: this.tr('COL_NM.DELETE'), contents: this.getDate(this.base.deleted_at), copyFlag: true },
            ];
        },
        vmInfo() {
            return [
                { title: `${this.tr('VM')} ${this.tr('COL_NM.ID')}`, contents: this.vm.vm_id, copyFlag: true },
                { title: `${this.tr('VM')} ${this.tr('COL_NM.NAME')}`, contents: this.vm.vm_name, copyFlag: true },
                {
                    title: this.tr('COL_NM.PLATFORM'), badge: this.vm.platform_type, badgeType: 'PLATFORM_TYPE', copyFlag: true,
                },
                { title: this.tr('COL_NM.IMAGE'), contents: this.vm.image, copyFlag: true },
                { title: this.tr('COL_NM.CREATE'), contents: this.getDate(this.vm.created_at), copyFlag: true },
            ];
        },
        computeInfo() {
            return [
                { title: this.tr('COL_NM.INST_ID'), contents: this.compute.instance_id, copyFlag: true },
                { title: this.tr('COL_NM.KEY_PAIR'), contents: this.compute.keypair, copyFlag: true },
                { title: this.tr('COL_NM.INST_TYPE'), contents: this.compute.instance_type, copyFlag: true },
                { title: this.tr('COL_NM.CREATE_BY'), contents: this.compute.created_by_user_id, copyFlag: true },
                { title: this.tr('COL_NM.SEC_GROUP'), contents: this.compute.security_groups, copyFlag: true },
            ];
        },
        tag() {
            const tag = [];
            for (const key in this.serverData.tags) {
                tag.push({
                    title: key,
                    contents: this.serverData.tags[key],
                    copyFlag: true,
                });
            }
            return tag;
        },
        tags() {
            return this.dictToKeyValueArray(this.serverData.tags);
        },
        panelData() {
            return [
                {
                    panelTitle: this.tr('PANEL.BASE_INFO'),
                    panelIcon: {
                        icon: 'fa-hashtag', type: 'l', size: 1, color: 'primary',
                    },
                    data: this.serverInfo,
                },
                {
                    panelTitle: this.tr('PANEL.VM'),
                    panelIcon: {
                        icon: 'fa-hashtag', type: 'l', size: 1, color: 'primary',
                    },
                    data: this.vmInfo,
                },
                {
                    panelTitle: this.tr('PANEL.COMPUTE'),
                    panelIcon: {
                        icon: 'fa-hashtag', type: 'l', size: 1, color: 'primary',
                    },
                    data: this.computeInfo,
                },
                {
                    panelTitle: this.tr('PANEL.TAG'),
                    panelIcon: {
                        icon: 'fa-tags', type: 'l', size: 1, color: 'danger',
                    },
                    data: this.tag,
                    editable: true,
                },
            ];
        },
    },
    methods: {
        async onEditTags() {
            if (this.$refs.IVSV002_Tags.validate()) {
                let res = null;
                try {
                    res = await this.$http.post('/identity/server/update', {
                        server_id: this.serverData.user_id,
                        tags: this.$refs.IVSV002_Tags.tags,
                    });
                    this.hideTagEditModal();
                    this.$emit('update', res.data);
                } catch (e) {
                    console.error(e);
                }
            }
        },
        getDate(timestampObj) {
            return timestampObj ? this.getDatefromTimeStamp(timestampObj.seconds, localStorage.getItem('timezone')) : '';
        },
        showTagEditModal() {
            this.$refs.IVSV002_TagEditModal.showModal();
        },
        hideTagEditModal() {
            this.$refs.IVSV002_TagEditModal.hideModal();
        },
    },
};
</script>

<style lang="scss" scoped>
</style>
