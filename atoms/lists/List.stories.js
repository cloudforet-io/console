import PLi from '@/components/atoms/lists/orun-list/Li';
import POl from '@/components/atoms/lists/orun-list/Ol';
import PUl from '@/components/atoms/lists/orun-list/Ul';
import PDd from '@/components/atoms/lists/dl-list/Dd';
import PDt from '@/components/atoms/lists/dl-list/Dt';
import PDl from '@/components/atoms/lists/dl-list/Dl';

export default {
    title: 'atoms/lists/',
    component: {
        PLi, POl, PUl, PDd, PDt, PDl,
    },
    parameters: {
        info: {
            summary: 'List expresses ul, ol, and li tags that represent lists, and the definition lists dl, dt, and dd tags in the HTML document, ',
            components: {
                PLi, POl, PUl, PDd, PDt, PDl,
            },
        },
    },
};

export const definitionList = () => ({
    components: { PDl, PDt, PDd  },
    template: ` <div>
                    <h1>Definition List</h1>
                    <PDl>
                      <PDt>WWW</PDt>
                      <PDd>WWW represents World Wide Web.</PDd>
                      <PDt>HTML</PDt>
                      <PDd>HTML represents HyperText Markup Language.</PDd>
                    </PDl>
                </div>`,
});

export const orderedList = () => ({
    components: { POl, PLi },
    template: `<div style="background: #f4f4f4; padding: 16px">
                     <h1>Ordered List</h1>
                    <POl>
                      <PLi>Lorem</PLi>
                      <PLi>Ipsum</PLi>
                      <PLi>Dolor</PLi>
                    </POl>
                </div>`,
});

export const unorderedList = () => ({
    components: { PUl, PLi },
    template: `<div>
                    <p-ul>
                         <p-li> Contents </p-li>   
                         <p-li> Contents </p-li>
                         <p-li> Contents </p-li>
                    </p-ul>
                </div>`,
});
