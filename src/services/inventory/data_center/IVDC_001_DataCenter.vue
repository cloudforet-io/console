<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col cols="12" sm="12" md="12" class="mb-12">
        <b-card>
          <div class="btn-toolbar item-list-actions">
            <slot name="buttons" />
            <div class="d-flex align-items-center ml-2">
              여긴뭐가들어갈까요?
            </div>
          </div>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" sm="6" md="5" lg="4" xl="3">
        <b-card>
          tree
        </b-card>
      </b-col>

      <b-col cols="12" sm="6" md="7" lg="8" xl="9">
        <b-card>
          contents
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: 'DataCenter'
}
</script>

<style lang="scss" scoped>

</style>
