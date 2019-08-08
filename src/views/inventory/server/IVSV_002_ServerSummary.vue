<template>
  <base-panel :panels="panelData" />
</template>

<script>
import BasePanel from '@/components/base/panel/BAPA_002_BasePanel';

export default {
    name: 'ServerSummary',
    components: {
        BasePanel
    },
    props: {

    },
    data () {
        return {
            panelData: null
        };
    },
    created: function () {
        this.setInitData();
    },
    methods: {
        setInitData(){
            const samplePanelData = [{ panelTitle: 'Base Information',
                panelIcon: {
                    icon: 'fa-hashtag',
                    type: 'l',
                    size: 1,
                    color: 'primary'
                },
                data: [
                    { title: 'ID', contents: 'pg-6bc72053', copyFlag:true },
                    { title: 'Name', contents: 'AWS Seoul', copyFlag:true },
                    { title: 'Created at', contents: '2019-05-12 18:00:12' , copyFlag:true }
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
                    { title: 'South Korea', contents: 'Seoul' },
                    { title: 'USA', contents: 'Washington D.C.' },
                    { title: 'Canada', contents: 'Ottawa' },
                    { title: 'Austria', contents: 'Vienna' },
                    { title: 'Germany', contents: 'Berlin' },
                    { title: 'G.B', contents: 'London' },
                    { title: 'France', contents: 'Paris' }
                ]
            }];
            this.panelData = samplePanelData;
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
