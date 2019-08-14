<template>
  <div class="row">
    <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-12">
      <b-card >
        <BasePanelJson
          :json-data="rawdata"
        />
      </b-card>
    </b-col>
  </div>
</template>

<script>
import BasePanelJson from '@/components/base/panel/BAPA_004_BasePanelJson';

export default {
    name: 'ServerRawData',
    components: {
        BasePanelJson
    },
    props: {

    },
    data () {
        return {
            rawdata :  {
                status: 200,
                error: '',
                data: [{
                    news_id: 51184,
                    title: 'iPhone X Review: Innovative future with real black technology',
                    source: 'Netease phone'
                }, {
                    news_id: 51183,
                    title: 'Traffic paradise: How to design streets for people and unmanned vehicles in the future?',
                    source: 'Netease smart'
                }, {
                    news_id: 51182,
                    title: 'Teslamask\'s American Business Relations: The government does not pay billions to build factories',
                    source: 'AI Finance',
                    members: ['Daniel', 'Mike', 'John']
                }]
            }
        };
    },

    watch: {

    },
    methods: {

    }
};
</script>

<style lang="scss" scoped>
</style>
