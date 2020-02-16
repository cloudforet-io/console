<template>
    <div class="summary">
        <p class="title">
            {{ tr('DASHBOARD.SUMMARY') }}
        </p>
        <div class="card-container">
            <p-board-layout v-for="(d, key) in dataMap" :key="key"
                            class="summary-card"
                            :class="{hover: d.hover}"
                            :style="{ width: `${100 / dataLength}%` }"
                            @mouseenter="onMouseEnter(key)"
                            @mouseleave="onMouseLeave(key)"
                            @click="onLinkClick(key, data[key])"
            >
                <span class="label">{{ d.label }}</span>
                <span class="count">
                    <animated-number :value="data[key]"
                                     :format-value="countFormatter"
                                     :duration="500"
                                     easing="easeInOutSine"
                    />
                </span>
            </p-board-layout>
        </div>
    </div>
</template>

<script>
import AnimatedNumber from 'animated-number-vue';
import numeral from 'numeral';
import PBoardLayout from '@/components/organisms/layouts/board-layout/BoardLayout';
import DashboardEventBus from '@/views/dashboard/DashboardEventBus';


export default {
    name: 'Summary',
    components: {
        PBoardLayout,
        AnimatedNumber,
    },
    props: {
        data: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            dataMap: {
                project: {
                    label: 'Project', path: '/identity/project', hover: false,
                },
                server: {
                    label: 'Server', path: '/inventory/server', hover: false,
                },
                // eslint-disable-next-line camelcase
                cloud_service: { label: 'Cloud Service', path: '/inventory/cloud-service', hover: false },
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
        DashboardEventBus.$emit('listSummary');
    },
    methods: {
        countFormatter(value) {
            return `${numeral(value).format('0,0')}`;
        },
        onMouseEnter(key) {
            this.dataMap[key].hover = true;
        },
        onMouseLeave(key) {
            this.dataMap[key].hover = false;
        },
        onLinkClick(key) {
            if (this.dataMap[key].path) {
                this.$router.push({ path: this.dataMap[key].path });
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
        cursor: pointer;
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
        }
    }

</style>
