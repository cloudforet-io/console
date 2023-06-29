<script lang="ts" setup>
import { PButton } from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const state = reactive({
    authOptions: computed<Record<string, any>>(() => store.state.domain.authOptions),
});

</script>

<template>
    <div class="kbSSO-wrapper">
        <form :action="state.authOptions.authorization_endpoint"
              method="post"
        >
            <input
                id="agentId"
                type="hidden"
                name="agentId"
                :value="state.authOptions.agent_id"
            >
            <p-button style-type="secondary"
                      size="lg"
                      class="kbSSO-btn"
            >
                KB SSO
            </p-button>
        </form>
    </div>
</template>

<style lang="postcss" scoped>
.kbSSO-btn {
    width: 100%;
}
</style>
