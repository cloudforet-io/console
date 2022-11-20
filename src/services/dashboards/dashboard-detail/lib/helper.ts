import { CARD_SIZE_ARY } from '@/services/dashboards/dashboard-detail/lib/config';

// const exampleList = ['MD', 'MD', 'SM', 'MD', 'LG', 'SM'];

const cardSizeExtractor = (s: string): Array<number> => {
    if (s === 'SM') return CARD_SIZE_ARY[0];
    if (s === 'MD') return CARD_SIZE_ARY[1];
    if (s === 'LG') return CARD_SIZE_ARY[2];
    if (s === 'XL') return CARD_SIZE_ARY[3];
    return [0];
};

const oneLineFirstChooser = (cardSizeList: Array<string>, containerWidth: number): Array<Array<Array<number>>> => {
    const retAry: Array<Array<Array<number>>> = [];
    // shift() 수행하기 때문에 미리 length 저장해두어야 함.
    const cardSizeListLen = cardSizeList.length;
    let oneLineSum = 0;
    let oneLineArray: Array<Array<number>> = [];

    // 1: 기본 사이즈로 컨테이너 크기와 비교 후 1개 라인의 배열 생성
    for (let i = 0; i < cardSizeListLen; i += 1) {
        const selected: Array<number> = cardSizeExtractor(cardSizeList.shift() as string);
        oneLineSum += selected[0];
        console.log('shift', oneLineSum);
        if (oneLineSum > containerWidth) {
            console.log('! push', oneLineSum);
            retAry.push(oneLineArray);
            oneLineArray = [];
            oneLineSum = selected[0];
        } else {
            console.log('no push', oneLineSum);
        }
        oneLineArray.push(selected);
    }

    // 마지막 원소 고려
    if (oneLineArray.length) {
        retAry.push(oneLineArray);
    }

    console.log('ret', retAry);
    return retAry;
};

const oneLineRealignment = (oneLineArray, containerWidth: number): Array<number> => {
    const sequenceAry: Array<number> = oneLineArray.map(() => 0);
    let realignedList: Array<number> = [];

    // size 리스트로 i가 돌잖아? 근데 size 는 3개만 있으니까 i는 3 고정으로 해도 될거같아.
    for (let i = 1; i < 3; i += 1) {
        let oneLineSum = 0;
        for (let k = 0; k < oneLineArray.length; k += 1) {
            realignedList = [];
            oneLineSum = 0;
            sequenceAry.unshift(i);
            for (let l = 0; l < oneLineArray.length; l += 1) {
                oneLineSum += oneLineArray[l][sequenceAry[l]];
                realignedList.push(oneLineArray[l][sequenceAry[l]]);
            }
            if (oneLineSum >= containerWidth) break;
        }
    }
    return realignedList;
};

export const listMap = (cardSizeList: Array<string>, containerWidth: number): Array<Array<number>> => {
    const ary: Array<Array<number>> = [];
    const firstChosen = oneLineFirstChooser(cardSizeList, containerWidth);

    // let oneLineSum = 0;
    // firstChosen?.forEach((d) => { oneLineSum += d[0]; });
    //
    // // 2: 기본 사이즈로 정렬이 된다면 그대로 리턴
    // if (oneLineSum === containerWidth) {
    //     ary.push(firstChosen?.map((d) => d[0]));
    // // 3: else, 앞에 위치한 카드부터 1씩 크기 증가시킴
    // } else {
    ary.push(oneLineRealignment(firstChosen, containerWidth));
    // }

    return ary;
};
