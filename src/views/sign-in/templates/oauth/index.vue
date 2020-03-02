<template>
    <div class="user-info">
        <div class="btn-divider">
            OR
        </div>
        <div class="flex flex-col mb-4 md:w-full">
            <p-button outline
                      style-type="gray"
                      type="submit"
                      size="lg"
            >
                Sign-in using root account credentials
            </p-button>
        </div>
    </div>
</template>

<script>
import PButton from '@/components/atoms/buttons/Button.vue';

export default {
    name: 'Oauth',
    components: {
        PButton,
    },
};
</script>

<style lang="postcss" scoped>

    .btn-divider {
        display: flex;
        flex-basis: 100%;
        align-items: center;
        color: #A5ACCE;
        font-style: normal;
        font-weight: bold;
        font-size: 14px;
        margin: 8px 0px;
    }
    .btn-divider::before,
    .btn-divider::after {
        content: "";
        flex-grow: 1;
        background: #A5ACCE;
        height: 1px;
        font-size: 0px;
        line-height: 0px;
        margin: 0px 16px;
    }
</style>
