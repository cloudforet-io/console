<template>
    <div class="summary">
        <div class="card-container">
            <p-board-layout v-for="(d, key) in dataMap" :key="key"
                            class="summary-card"
                            :class="{hover: d.hover}"
                            :style="{ width: `${100 / dataLength}%` }"
                            @mouseenter="onMouseEnter(key)"
                            @mouseleave="onMouseLeave(key)"
            >
                <span class="label">{{ d.label }}</span>
                <span class="count"
                      @click="onLinkClick(key, data[key])"
                >{{ data[key] || 0 }}</span>
            </p-board-layout>
        </div>
    </div>
</template>
<script>
import PBoardLayout from '@/components/organisms/layouts/board-layout/BoardLayout';
export default {
    name: 'Summary',
    components: {
        PBoardLayout,
    },
    props: {
        data: {
            type: Object,
            required: true,
        },
        selectedNode: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            dataMap: {
                member: {
                    label: 'Members', path: '/identity/project', hover: false,
                },
                server: {
                    label: 'Server', path: '/inventory/server', hover: false,
                },
                // eslint-disable-next-line camelcase
                cloud_service: { label: 'Cloud Service', hover: false },
                network: { label: 'Network', hover: false },
            },
        };
    },
    computed: {
        dataLength() {
            return Object.keys(this.dataMap).length;
        },
    },
    watch: {
        data() {
            /**
                 * TODO: Start Number Increase Animation
                 */
        },
    },
    created() {
    },
    methods: {
        onMouseEnter(key) {
            this.dataMap[key].hover = true;
        },
        onMouseLeave(key) {
            this.dataMap[key].hover = false;
        },
        onLinkClick(key, val) {
            console.log('onLinkClick', key, val);
            if (this.dataMap[key].path) {
                this.$router.push({ path: this.dataMap[key].path, query: { plan: 'private' } });
            }
        },
    },
};
</script>

<style lang="scss" scoped>
    .summary {
        width: 100%;
    }
    .title {
        color: $primary2;
        font-size: 1rem;
        font-weight: bold;
        padding-bottom: .5rem;
    }
    .card-container {
        display: flex;
        width: 100%;
        min-height: 100px;
    }
    .summary-card {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 2rem 1rem;
        margin-right: 1rem;
        &:last-child {
            margin-right: 0;
        }
        &.hover {
            border: 1px solid $secondary;
            color: $secondary;
            .count {
                color: $secondary;
            }
        }
        .label {
            font-size: 1.125rem;
            line-height: 1.313rem;
            max-width: 45%;
        }
        .count {
            font-size: 2rem;
            color: $primary-dark;
            font-weight: bold;
            cursor: pointer;
        }
    }

</style>
