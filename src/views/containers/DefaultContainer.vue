<template>
    <div class="app">
        <GNB class="gnb" />

        <div class="app-body">
            <router-view name="lnb" />

            <main
                class="main"
                :style="{minHeight: mainMinHeight}"
            >
                <router-view name="main" />
            </main>

            <div
                v-if="defaultFNB"
                class="fnb"
            >
                <FNB />
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import styles from '@/styles/_variables.scss';
import GNB from '@/views/containers/gnb/GNB';
import FNB from '@/views/containers/fnb/FNB';

export default {
    name: 'DefaultContainer',
    components: { GNB, FNB },
    computed: {
        ...mapGetters('layout', [
            'defaultFNB',
        ]),
        mainMinHeight() {
            if (this.defaultFNB) {
                return `calc(100vh - ${styles.lnbHeight} - ${styles.fnbHeight})`;
            }
            return `calc(100vh - ${styles.lnbHeight})`;
        },
    },
};
</script>

<style lang="scss" scoped>
    $min-width: 1200px;
.app {
    overflow-y: hidden;
    min-height: 100vh;
    min-width: $min-width;
    .gnb {
        display: inline-block;
        position: fixed;
        height: 100vh;
        width: $gnb-width;
        z-index: 100;
    }
    .app-body {
        position: fixed;
        left: $gnb-width;
        top: 0;
        overflow-y: scroll;
        max-height: 100%;
        //margin-left: $gnb-width;
        width: calc(100vw - #{$gnb-width});
        min-width: calc(#{$min-width} - #{$gnb-width});
        min-height: 100vh;
        .main {
            margin: 0;
            width: calc(100vw - #{$gnb-width});
            min-width: calc(#{$min-width} - #{$gnb-width});
            overflow-x: hidden;
        }
    }
}
</style>
