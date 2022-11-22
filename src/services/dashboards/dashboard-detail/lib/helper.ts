import { CARD_SIZE_ARY } from '@/services/dashboards/dashboard-detail/lib/config';


const cardSizeExtractor = (s: string): Array<number> => {
    if (s === 'SM') return CARD_SIZE_ARY[0];
    if (s === 'MD') return CARD_SIZE_ARY[1];
    if (s === 'LG') return CARD_SIZE_ARY[2];
    if (s === 'XL') return CARD_SIZE_ARY[3];
    return [0];
};


const eachLineCardWidthAssigner = (cardSizeList: Array<string>, containerWidth: number): Array<Array<Array<number>>> => {
    const eachLineCardWidth: Array<Array<Array<number>>> = [];
    // shift() 수행하기 때문에 미리 length 저장해두어야 함.
    const cardSizeListLen = cardSizeList.length;
    let oneLineSum = 0;
    let oneLineArray: Array<Array<number>> = [];

    // 1: 기본 사이즈로 컨테이너 크기와 비교 후 1개 라인의 배열 생성
    for (let i = 0; i < cardSizeListLen; i += 1) {
        const selected: Array<number> = cardSizeExtractor(cardSizeList.shift() as string);
        oneLineSum += selected[0];
        if (oneLineSum > containerWidth) {
            eachLineCardWidth.push(oneLineArray);
            oneLineArray = [];
            oneLineSum = selected[0];
        }
        oneLineArray.push(selected);
    }

    // 마지막 원소 고려
    if (oneLineArray.length) {
        eachLineCardWidth.push(oneLineArray);
    }

    return eachLineCardWidth;
};


const oneLineRealignment = (oneLineArray: Array<Array<Array<number>>>, containerWidth: number): Array<Array<number>> => {
    const sequenceAry: Array<Array<number>> = [];
    const retAry: Array<Array<number>> = [];

    for (let i = 0; i < oneLineArray.length; i += 1) {
        const oneLineSequence: Array<number> = [];
        for (let j = 0; j < oneLineArray[i].length; j += 1) {
            oneLineSequence.push(0);
        }
        sequenceAry.push(oneLineSequence);
    }

    // j > 각 row 순회 => 0 < 3
    for (let j = 0; j < oneLineArray.length; j += 1) {
        let oneLineSum = 0;
        let oneLineArrayRe: Array<number> = [];
        // k > sequenceAry 순회   => 0 < 3
        for (let i = 1; i < 3; i += 1) {
            for (let k = 0; k < oneLineArray[j].length; k += 1) {
                oneLineSum = 0;
                oneLineArrayRe = [];
                sequenceAry[j].unshift(i);
                console.log('seq', j, sequenceAry[0], sequenceAry[1], sequenceAry[2]);
                // l > 각 row 합 비교 / 한 줄 push    => 0 < 3
                for (let l = 0; l < oneLineArray[j].length; l += 1) {
                    oneLineSum += oneLineArray[j][l][sequenceAry[j][l]];
                    console.log('+=', j, l, oneLineArray[j][l]);

                    if (oneLineSum > containerWidth) {
                        retAry.push(oneLineArrayRe);
                        console.log('push>', j, l, oneLineArrayRe);
                        break;
                    }

                    if (oneLineSum === containerWidth) {
                        oneLineArrayRe.push(oneLineArray[j][l][sequenceAry[j][l]]);
                        retAry.push(oneLineArrayRe);
                        console.log('push=', j, l, oneLineArrayRe);
                        break;
                    }

                    oneLineArrayRe.push(oneLineArray[j][l][sequenceAry[j][l]]);
                }
                if (oneLineSum >= containerWidth) {
                    console.log('break1');
                    break;
                }
            }
            if (oneLineSum >= containerWidth) {
                console.log('break2');
                break;
            }
            if (i === 2 && oneLineArrayRe.length) {
                console.log('pushF', oneLineArrayRe);
                retAry.push(oneLineArrayRe);
            }
        }
    }

    console.log('ret', retAry);
    return retAry;
};

export const listMap = (cardSizeList: Array<string>, containerWidth: number): Array<Array<number>> => {
    const eachLineCardList = eachLineCardWidthAssigner(cardSizeList, containerWidth);
    return oneLineRealignment(eachLineCardList, containerWidth);
};
