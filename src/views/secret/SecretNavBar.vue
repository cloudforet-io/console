<script>
import LNBTemplate from '@/views/containers/lnb/LNB.template.vue';

export default {
    name: 'SecretNavBar',
    extends: LNBTemplate,
    data() {
        return {
            serviceGroup: 'Secret',
            services: [
                { path: '/secret/credentials-group', label: 'Credentials Group' },
                { path: '/secret/credentials', label: 'Credentials' },
            ],
        };
    },
};
</script>
