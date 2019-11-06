<script>
import LNBTemplate from '@/views/containers/lnb/LNB.template.vue';

export default {
    name: 'IdentityNavBar',
    extends: LNBTemplate,
    data() {
        return {
            serviceGroup: 'Identity',
            services: [
                { path: '/identity/user', label: 'User' },
                { path: '/identity/project', label: 'Project' },
            ],
        };
    },
};
</script>
