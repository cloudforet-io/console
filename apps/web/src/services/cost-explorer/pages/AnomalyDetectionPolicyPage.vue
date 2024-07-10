<script setup lang="ts">
import { PHeading } from '@spaceone/design-system';

import AnomalyDetectionPolicyRuleCard from '@/services/cost-explorer/components/AnomalyDetectionPolicyRuleCard.vue';
</script>

<template>
    <div>
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.POLICY.TITLE')" />
        <anomaly-detection-policy-rule-card policy-name="급격한 총 비용 변화 탐지"
                                            description="전날 대비 선택한 필드 목록 외의 필드에서 비용 발생시 알림"
        />
    </div>
</template>
