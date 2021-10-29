<template>
    <div class="kbSSO-wrapper">
        <form :action="authOptions.authorization_endpoint" method="post">
          <input 
            type="hidden"
            id="agentId"
            name="agentId"
            :value="authOptions.agent_id">
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
import {
    ComponentRenderProxy, defineComponent, getCurrentInstance, computed, reactive, toRefs,
} from '@vue/composition-api';
import { PButton } from '@spaceone/design-system';

export default defineComponent({
    name: 'KBSignIn',
    components: {
        PButton,
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
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