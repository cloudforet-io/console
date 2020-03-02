<template>
    <div class="user-info">
        <div id="login-info" class="field-group text-left mb-4 md:flex md:flex-wrap md:justify-between">
            <p class="input-title">
                User ID
            </p>
            <div class="flex flex-col mb-4 md:w-full">
                <p-text-input ref="userId"
                              class="form-control"
                              placeholder="User ID"
                              required
                /><br>
            </div>
            <p class="input-title">
                Password
            </p>
            <div class="flex flex-col mb-4 md:w-full">
                <p-text-input ref="password"
                              type="password"
                              class="form-control"
                              placeholder="Password"
                              required
                />
            </div>
        </div>
        <div class="flex flex-col mb-4 md:w-full">
            <p-button style-type="primary"
                      type="submit"
                      size="lg"
            >
                Login
            </p-button>
        </div>
    </div>
</template>

<script>
import PButton from '@/components/atoms/buttons/Button.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';

export default {
    name: 'Admin',
    components: {
        PButton,
        PTextInput,
    },
};
</script>

<style lang="postcss" scoped>
    .input-title {
        font-size: 0.875rem;
        font-weight: bold;
        padding-top: 16px;
        padding-bottom: 4px;
    }
</style>
