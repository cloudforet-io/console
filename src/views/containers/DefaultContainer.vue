<template>
    <div class="app">
        <GNB class="gnb" />

        <div class="app-body">
            <router-view name="lnb" />

            <main class="main">
                <router-view name="main" />
            </main>
        </div>
    </div>
</template>

<script>
import _ from 'lodash';
import { reactive, toRefs } from '@vue/composition-api';

import GNB from '@/views/containers/gnb/GNB.vue';

export default {
    name: 'DefaultContainer',
    components: { GNB },
    setup(props, { root }) {
        const state = reactive({
            disableFNB: _.get(root, '$route.meta.disableFNB', false),
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="scss" scoped>
    $min-width: 1200px;
.app {
    display: flex;
    flex-wrap: wrap;
    overflow-y: hidden;
    min-height: 100vh;
    min-width: $min-width;
    width: 100vw;
    .gnb {
        display: inline-block;
        height: 100vh;
        width: $gnb-width;
        z-index: 100;
    }
    .app-body {
        overflow-y: auto;
        height: 100vh;
        width: calc(100vw - #{$gnb-width});
        min-width: calc(#{$min-width} - #{$gnb-width});

        .main {
            height: calc(100vh - #{$lnb-height});
            margin: 0;
            width: calc(100vw - #{$gnb-width});
            min-width: calc(#{$min-width} - #{$gnb-width});
            overflow-x: hidden;
            /*padding-bottom: 2rem;*/
        }
    }
}
</style>
