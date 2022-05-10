<template>
    <section>
        <!--song-lang-->
        <article class="desc-wrapper">
            <h2 class="header2">
                Role Type
            </h2>
            <p class="desc2">
                Restrict access to project management with different role type.
            </p>
            <h4 class="header4">
                ‘User’:
            </h4>
            <p class="desc4">
                Only invited(or self-made) projects/project groups and their child projects can be managed.
            </p>
            <h4 class="header4">
                ‘Admin’:
            </h4>
            <p class="desc4">
                Full access to all projects/ project groups.
            </p>
        </article>
        <p-divider class="divider" />
        <article class="desc-wrapper">
            <h2 class="header2">
                Page Access
            </h2>
            <p class="desc2">
                Restrict access to each page with ‘View’ & ‘Manage’ permission.
            </p>
            <h4 class="header4">
                ‘View’:
            </h4>
            <p class="desc4">
                Only users with this permission for specific service can view its page.
            </p>
            <h4 class="header4">
                ‘Manage’:
            </h4>
            <p class="desc4">
                Only users with this permission for specific service can access to its admin features such as Create, Edit, Add etc., (Each service has its own admin features)
            </p>
        </article>
        <p-divider class="divider" />
        <h2 class="header2">
            API Policy Attachment
        </h2>
        <p class="desc2">
            A policy can reference the resource it wants to apply to. Access is granted with RBAC.
        </p>
        <p class="desc4">
            Create new or manage existing policy
            <p-anchor :highlight="true"
                      :to="{
                          name: ADMINISTRATION_ROUTE.IAM.POLICY._NAME,
                      }"
            >
                here
            </p-anchor>
        </p>
    </section>
</template>

<script lang="ts">
import { PAnchor, PDivider } from '@spaceone/design-system';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

export default {
    name: 'RoleCreateEditHandbook',
    components: {
        PAnchor,
        PDivider,
    },
    setup() {
        return {
            ADMINISTRATION_ROUTE,
        };
    },
};
</script>

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
    &:last-child {
        margin-bottom: 0;
    }
}
.divider {
    margin-top: 1rem;
    margin-bottom: 1.25rem;
}
</style>
