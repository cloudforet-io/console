<template>
    <div class="progress-bar">
        <div class="info">
            <label class="percentage"> {{label}}  </label>
        </div>
        <div class="background-bar" />
        <transition appear @before-appear="beforeEnter" @after-appear="enter">
            <div class="tracker-bar" />
        </transition>
    </div>
</template>

<script>
export default {
    name: 'PProgressBar',
    props: {
        percentage: {
            type: Number,
            default: 0,
        },
        label: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const beforeEnter = (element) => {
            element.style.width = 0;
        };

        const enter = (element) => {
            element.style.width = `${props.percentage}%`;
            element.style.transition = 'width 1s linear';
        };

        return {
            beforeEnter,
            enter,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .active {
        label {
            @apply text-blue-500;
        }
        .tracker-bar {
            @apply bg-blue-500;
        }
    }
    .progress-bar {
        width: 100%;

        label {
            color: grey;
        }
        .info {
            font-size: 17px;
            justify-content: space-between;
            display: flex;
            color: grey;
            text-transform: uppercase;
            .percentage {
                font-weight: bolder;
            }
        }
        .background-bar {
            @apply bg-gray-100;
            width: 100%;
            height: 6px;
            border-radius: 2px;
        }

        .tracker-bar {
            @apply bg-primary;
            height: 5px;
            border-radius: 2px;
            width: 0;
            transition: width 0.5s linear;
            margin-top: -5px;
        }
    }
</style>
