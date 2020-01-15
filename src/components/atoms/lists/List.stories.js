import PLi from '@/components/atoms/lists/orun-list/Li.vue';
import POl from '@/components/atoms/lists/orun-list/Ol.vue';
import PUl from '@/components/atoms/lists/orun-list/Ul.vue';
import PDd from '@/components/atoms/lists/dl-list/Dd.vue';
import PDt from '@/components/atoms/lists/dl-list/Dt.vue';
import PDl from '@/components/atoms/lists/dl-list/Dl.vue';

export default {
    title: 'atoms/lists',
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
                    <h2>Definition List</h2>
                    <br>
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
    template: `<div>
                     <h2>Ordered List</h2>
                     <br>
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
                    <h2>Unordered List</h2>
                    <br>
                    <p-ul>
                         <p-li> Contents </p-li>   
                         <p-li> Contents </p-li>
                         <p-li> Contents </p-li>
                    </p-ul>
                </div>`,
});
