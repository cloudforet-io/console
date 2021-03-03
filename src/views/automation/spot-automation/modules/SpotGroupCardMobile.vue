<template>
    <article class="mobile-wrapper">
        <div class="left-desc">
            <p class="card-content-text">
                스팟 인터럽트 <span class="card-content-number">4 </span>
            </p>
            <p class="card-content-text">인스턴스 <span class="card-content-number">10 </span>개</p>
            <p class="card-content-text">인스턴스 평균 CPU 사용률 <span class="card-content-number">0 </span>%</p>
            <p class="card-content-text">평균 디스크 사용률 <span class="card-content-number">0 </span>IOPS</p>
        </div>
        <div class="right-desc">
            <p class="card-content-text">로드밸런서 (개수) <span class="card-content-number">1 </span>개</p>
            <p class="card-content-text">LB Active Sessions <span class="card-content-number">0 </span></p>
            <p class="card-content-text">LB Throughput <span class="card-content-number">0 </span>MB/s</p>
        </div>
    </article>
</template>

<script lang="ts">
export default {
    name: 'SpotGroupCardMobile',
};
</script>

<style lang="postcss" scoped>
.mobile-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1rem 1rem;

    .card-content-text {
        @apply text-gray-600;
        font-size: 0.75rem;
        line-height: 150%;
        margin-bottom: 0.25rem;
    }
    .card-content-number {
        @apply text-gray-900 font-bold;
        font-size: 0.75rem;
        line-height: 150%;
    }


    @screen sm {
        flex-direction: row;
    }

    @screen md {
        flex-direction: row;
    }
}
</style>
