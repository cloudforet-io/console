<script lang="ts" setup>
import { PDivider } from '@spaceone/design-system';

</script>

<template>
    <section>
        <article class="desc-wrapper">
            <h2 class="header2">
                {{ $t('IAM.ROLE.HANDBOOK.ROLE_TYPE') }}
            </h2>
            <p class="desc2">
                {{ $t('IAM.ROLE.HANDBOOK.ROLE_TYPE_DESC') }}
            </p>
            <h4 class="header4">
                {{ $t('IAM.ROLE.HANDBOOK.ROLE_TYPE_ADMIN') }}
            </h4>
            <p class="desc4">
                {{ $t('IAM.ROLE.HANDBOOK.ROLE_TYPE_ADMIN_DESC') }}
            </p>
            <h4 class="header4">
                {{ $t('IAM.ROLE.HANDBOOK.ROLE_TYPE_WORKSPACE_OWNER') }}
            </h4>
            <p class="desc4">
                {{ $t('IAM.ROLE.HANDBOOK.ROLE_TYPE_WORKSPACE_OWNER_DESC') }}
            </p>
            <h4 class="header4">
                {{ $t('IAM.ROLE.HANDBOOK.ROLE_TYPE_WORKSPACE_MEMBER') }}
            </h4>
            <p class="desc4">
                {{ $t('IAM.ROLE.HANDBOOK.ROLE_TYPE_WORKSPACE_MEMBER_DESC') }}
            </p>
        </article>
        <p-divider class="divider" />
        <article class="desc-wrapper">
            <h2 class="header2">
                {{ $t('IAM.ROLE.HANDBOOK.PERMISSION') }}
            </h2>
            <p class="desc2">
                {{ $t('IAM.ROLE.HANDBOOK.PERMISSION_DESC') }}
            </p>
            <h4 class="header4">
                {{ $t('IAM.ROLE.HANDBOOK.PERMISSION_PAGE_ACCESS') }}
            </h4>
            <p class="desc4">
                {{ $t('IAM.ROLE.HANDBOOK.PERMISSION_PAGE_ACCESS_DESC') }}
            </p>
            <h4 class="header4">
                {{ $t('IAM.ROLE.HANDBOOK.PERMISSION_API_POLICY') }}
            </h4>
            <p class="desc4">
                {{ $t('IAM.ROLE.HANDBOOK.PERMISSION_API_POLICY_DESC') }}
            </p>
        </article>
    </section>
</template>

<style lang="postcss" scoped>
.header2 {
    @apply font-bold;
    font-size: 1rem;
    line-height: 1.5rem;
    margin-bottom: 0.5rem;
}

.header4 {
    @apply font-bold;
    font-size: 0.875rem;
    line-height: 1.3125rem;
    margin: 0.5rem 0;
}
.desc2 {
    font-size: 1rem;
    line-height: 1.5rem;
    margin-top: 0.25rem;
    margin-bottom: 1rem;
}
.desc4 {
    font-size: 0.875rem;
    line-height: 1.3125rem;
    margin-bottom: 1.5rem;
    .p-link {
        line-height: 1.3125;
    }
    &:last-child {
        margin-bottom: 0;
    }
}
.divider {
    margin-top: 1rem;
    margin-bottom: 1.25rem;
}
</style>
