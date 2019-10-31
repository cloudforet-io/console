<template>
    <div class="app">
        <GNB class="gnb" />

        <div class="app-body">
            <div class="lnb">
                <router-view name="lnb" />
            </div>

            <main
                class="main"
                :style="{height: mainMinHeight}"
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
import styles from '@/assets/style/_variables.scss';
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
.app {
    overflow-y: hidden;
    min-height: 100vh;
    .gnb {
        display: inline-block;
        position: fixed;
        height: 100vh;
        width: $gnb-width;
        border: 1px solid red;
        z-index: 100;
    }
    .app-body {
        margin-left: $gnb-width;
        width: calc(100vw - #{$gnb-width});
        border: 1px solid blue;
        min-height: 100vh;
        .lnb {
            height: $lnb-height;
        }
        .main {
            margin: 0;
            width: calc(100vw - #{$gnb-width});
            overflow-x: hidden;
            border: 1px solid orange;
        }
    }
}
</style>
