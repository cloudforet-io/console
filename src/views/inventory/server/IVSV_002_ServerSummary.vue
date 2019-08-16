<template>
  <div>
    <base-notice-panel :notice-panel-data="selectedNoticePanelData" />
    <base-panel :panels="panelData" />
  </div>
</template>

<script>
import BasePanel from '@/components/base/panel/BAPA_002_BasePanel';
import BaseNoticePanel from '@/components/base/panel/BAPA_001_BaseNoticePanel';

export default {
    name: 'ServerSummary',
    components: {
        BasePanel
        ,BaseNoticePanel
    },
    props: {

    },
    data () {
        return {
            panelData: null,
            selectedNoticePanelData: null
        };
    },
    created: function () {
        this.setInitData();
    },
    methods: {
        setInitData(){
            this.bindEnumToHtml('SERVER_STATE.MAINTENANCE');
            const samplePanelData = [{ panelTitle: 'Base Information',
                panelIcon: {
                    icon: 'fa-hashtag',
                    type: 'l',
                    size: 1,
                    color: 'primary'
                },
                data: [
                    { title: 'ID', contents: 'pg-6bc72053', status: {
                        flag: 'fail',
                        variantSize: 2,
                        text: 'VM'
                    }},
                    { title: 'Name', contents: 'AWS Seoul', copyFlag: true },
                    { title: 'Created at', contents: '2019-05-12 18:00:12' , copyFlag: true }
                ]},
            {
                panelTitle: 'Tag',
                panelIcon: {
                    icon: 'fa-tags',
                    type: 'l',
                    size: 1,
                    color: 'danger'
                },
                data: [
                    { title: 'Japan', contents: 'Tokyo' },
                    { title: 'South Korea', contents: 'Seoul' ,link: 'www.yahoo.com' },
                    { title: 'USA', contents: 'Washington D.C.' },
                    { title: 'Canada', contents: 'Ottawa' },
                    { title: 'Austria', contents: 'Vienna' },
                    { title: 'Germany', contents: 'Berlin' },
                    { title: 'G.B', contents: 'London' },
                    { title: 'France', contents: 'Paris' }
                ]
            }];

            const sampleNoticePanel = {
                header:{
                    headerIcon: {
                        icon: 'fa-exclamation-circle',
                        type: 'l',
                        size: 1,
                        color: 'primary'
                    },
                    text:'리눅스 정보 추가 수집 필요'
                }, contents:[{ text:' This is sample test' },
                    { text:'네트워크 ACL에서 SSH (TCP 22) 및 ICMP 포트 오픈 확인' },
                    { text:'클라우드 인스턴스 인 경우 Security Group 추가 확인' },
                    { text:'사내 LDAP 연동 또는 리눅스 계정(sdiadmin) 생성' },
                    { text:'SUDO NOPASSWD 권한 설정' },
                    { text:'Actions > Collect Info 버튼 클릭 후 Linux Collector 실행' },
                    { text:'리눅스 수집 실패 시 COMMAND 탭에서 로그 확인 (수집 실패 원인)\n' }
                ], footer:{
                    title: '수집 관련 문의:',
                    text: 'sdi-dev@ncsoft.com'
                }
            };
            this.selectedNoticePanelData = sampleNoticePanel;
            this.panelData = samplePanelData;
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
