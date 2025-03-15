import { getSortingData } from '@/utils';

const mockLoadData = {
    stringOnly: {
        data: ['dev', 'art', 'strengths', 'finder'],
        result: ['art', 'dev', 'finder', 'strengths'],
    },
    mixedTexts: {
        data: ['14일 평균', '10일', '14일', '1일'],
        // result: ['10일', '14일', '14일 평균', '1일'],
        result: ['1일', '10일', '14일', '14일 평균'],
    },
    mixedTextsAndNumbers: {
        data: ['1년 2월', '1월 3일', '1월 2일', '13', '12'],
        result: ['12', '13', '1년 2월', '1월 2일', '1월 3일'],
    },
};

describe('Dynamic layout raw table data sorting', () => {
    test('String only', () => {
        expect(getSortingData(mockLoadData.stringOnly.data))
            .toStrictEqual(mockLoadData.stringOnly.result);
    });

    describe('Mixed sorting', () => {
        test('Sort mixed texts', () => {
            expect(getSortingData(mockLoadData.mixedTexts.data))
                .toStrictEqual(mockLoadData.mixedTexts.result);
        });

        test('Sort mixed texts and numbers', () => {
            expect(getSortingData(mockLoadData.mixedTextsAndNumbers.data))
                .toStrictEqual(mockLoadData.mixedTextsAndNumbers.result);
        });
    });
});
