<template>
  <div class="row">
    <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-12">
      <b-card>
        <BasePanelJson
          :json-data="serverData"
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
        serverData: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {
        };
    }
};
</script>

<style lang="scss" scoped>
</style>
