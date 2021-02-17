<template>
    <fragment>
        <div>
            spot group page
        </div>
        <div @click="goToAddSpotGroupPage">
            go to add spot group page
        </div>
        <div @click="goToAddSpotGroupDetailPage">
            go to spot group detail page
        </div>

    </fragment>
</template>

<script lang="ts">
import { ComponentRenderProxy, getCurrentInstance } from '@vue/composition-api';

export default {
    name: 'SpotGroupPage',
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const goToAddSpotGroupPage = () => {
            vm.$router.push({ name: 'addSpotGroup' }).catch(() => {});
        };
        const goToAddSpotGroupDetailPage = () => {
            vm.$router.push({ name: 'spotGroupDetail', params: { id: '1' } }).catch(() => {});
        };
        return {
            goToAddSpotGroupPage,
            goToAddSpotGroupDetailPage,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
