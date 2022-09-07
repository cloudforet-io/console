<template>
    <div class="kbSSO-wrapper">
        <form :action="authOptions.authorization_endpoint" method="post">
            <input
                id="agentId"
                type="hidden"
                name="agentId"
                :value="authOptions.agent_id"
            >
            <p-button
                style-type="primary1 outline"
                size="lg"
                class="kbSSO-btn"
            >
                KB SSO
            </p-button>
        </form>
    </div>
</template>

<script lang="ts">
import { PButton } from '@spaceone/design-system';
import type { ComponentRenderProxy } from 'vue';
import {
    defineComponent, getCurrentInstance, computed, reactive, toRefs,
} from 'vue';


export default defineComponent({
    name: 'KBSignIn',
    components: {
        PButton,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as ComponentRenderProxy;
        const state = reactive({
            authOptions: computed(() => vm.$store.state.domain.authOptions),
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss" scoped>
.kbSSO-btn {
    width: 100%;
}
</style>
