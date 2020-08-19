<template>
    <div class="app">
        <GNB class="gnb" />

        <div class="app-body">
            <!--            <router-view name="lnb" />-->

            <main class="main">
                <router-view name="main" />
            </main>
        </div>
    </div>
</template>

<script>
import { get } from 'lodash';
import { reactive, toRefs } from '@vue/composition-api';

import GNB from '@/views/containers/gnb/GNB.vue';

export default {
    name: 'DefaultContainer',
    components: { GNB },
    setup(props, { root }) {
        const state = reactive({
            disableFNB: get(root, '$route.meta.disableFNB', false),
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
    .app {
        display: flex;
        overflow-y: hidden;
        width: 100vw;
        .gnb {
            position: fixed;
            width: 100vw;
            height: 3rem;
            z-index: 100;
        }
        .app-body {
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            height: 100vh;
            width: 100%;
            padding-top: 3rem;
            .main {
                height: 100%;
                margin: 0;
                overflow-x: hidden;
                /*padding-bottom: 2rem;*/
            }
        }
    }
</style>
