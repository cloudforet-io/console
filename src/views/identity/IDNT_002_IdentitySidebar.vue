<template>
  <BaseSidebar :nav="nav" />
</template>

<script>
import BaseSidebar from '@/containers/sidebar/CTSB_001_Sidebar';

export default {
    name: 'IdentitySidebar',
    components: {
        BaseSidebar
    },
    data () {
        return {
            nav: [
                {
                    title: true,
                    name: 'Identity'
                },
                {
                    divider: true
                },
                {
                    name: 'Project',
                    url: '/identity/project',
                    icon: 'icon-book-open'
                },
                {
                    name: 'User',
                    url: '/identity/user',
                    icon: 'fa fa-users fa-lg'
                }
            ]
        };
    }
};
</script>
