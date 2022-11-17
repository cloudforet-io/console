import { CARD_SIZE_ARY } from '@/services/dashboards/dashboard-detail/lib/config';

// const exampleList = ['MD', 'MD', 'SM', 'MD', 'LG', 'SM'];
// containerWidth = 1360;

const sizeExtractor = (s: string): Array<number> => {
    if (s === 'SM') return CARD_SIZE_ARY[0];
    if (s === 'MD') return CARD_SIZE_ARY[1];
    if (s === 'LG') return CARD_SIZE_ARY[2];
    if (s === 'XL') return CARD_SIZE_ARY[3];
    return [0];
};

export const listMap = (cardSizeList: Array<string>, containerWidth: number): Array<Array<number>> => {
    const ary: Array<number> = [];
    // let initialWidth = containerWidth;

    let oneLineSum = 0;
    const oneLineArray: Array<Array<number>> = [];

    // 1: 기본 사이즈로 컨테이너 크기와 비교 후 1개 라인의 배열 생성
    while (oneLineSum <= containerWidth && cardSizeList.length) {
        if (oneLineSum + (cardSizeList[0] as unknown as number) >= containerWidth) break;
        oneLineSum += sizeExtractor(cardSizeList.shift() as string)[0];
        oneLineArray.push(sizeExtractor(cardSizeList.shift() as string));
    }
    console.log('eow', oneLineSum);
    // 2: 기본 사이즈로 정렬이 된다면 그대로 리턴
    // 3: else, 앞에 위치한 카드부터 1씩 크기 증가시킴
    if (oneLineSum === containerWidth) {
        oneLineArray.forEach((d) => {
            ary.push(d[0]);
        });
    } else {
        // TODO:: WIP
        // oneLineSum = 0;
        // let aryIndex = 0;
        // while (oneLineSum <= containerWidth) {
        //     oneLineArray.forEach((d) => {
        //         aryIndex += 1;
        //     });
        // }
    }

    return [[1, 2, 3], [4, 5, 6]];
};
