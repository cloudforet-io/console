<template>
  <AppSidebar fixed>
    <SidebarHeader />
    <SidebarForm />
    <SidebarNav :nav-items="nav" />
    <SidebarFooter />
    <SidebarMinimizer />
  </AppSidebar>
</template>

<script>
import { Sidebar as AppSidebar, SidebarFooter, SidebarForm, SidebarHeader, SidebarMinimizer, SidebarNav } from '@coreui/vue';

export default {
    name: 'BaseSidebar',
    components: {
        AppSidebar,
        SidebarForm,
        SidebarFooter,
        SidebarHeader,
        SidebarMinimizer,
        SidebarNav
    },
    props: ['nav']
};
</script>

<style lang="scss" scoped>

</style>
