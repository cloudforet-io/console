import dayjs from 'dayjs';

/**
 * @name getLatestMonth
 * @description "최신 월". 오늘 기준 저번 달을 달력 기준으로 반환한다.
 * 발행된 리포트의 존재 여부나 데이터 유무와 무관하게 결정되며,
 * 화면에 표시되는 금액과 날짜 라벨은 모두 이 값에서 파생되어야 한다.
 */
export const getLatestMonth = (): string => dayjs.utc().subtract(1, 'month').format('YYYY-MM');

/**
 * @name getCurrentMonth
 * @description 진행 중인 달. 아직 확정되지 않은(is_confirmed: false) 데이터가 쌓이는 구간이다.
 */
export const getCurrentMonth = (): string => dayjs.utc().format('YYYY-MM');
