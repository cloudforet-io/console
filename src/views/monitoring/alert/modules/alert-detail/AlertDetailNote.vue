<template>
    <p-pane-layout class="alert-detail-note">
        <p-panel-top>
            {{ $t('MONITORING.ALERT.DETAIL.NOTE.NOTE') }}
        </p-panel-top>
        <article class="note-wrapper">
            <p-collapsible-list :items="noteList" toggle-position="contents" :line-clamp="2">
                <template #title="{title, index}">
                    <span class="author">{{ title }}</span>
                    <span class="date">{{ iso8601Formatter(noteList[index].created_at, timezone) }}</span>
                </template>
            </p-collapsible-list>
            <p-textarea v-model="noteInput" />
            <p-button style-type="gray-border" size="md" class="add-btn"
                      @click="createNote"
            >
                {{ $t('MONITORING.ALERT.DETAIL.NOTE.ADD_NOTE') }}
            </p-button>
        </article>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PButton, PCollapsibleList, PPaneLayout, PPanelTop, PTextarea,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { TimeStamp } from '@/models';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { iso8601Formatter } from '@/lib/util';
import { store } from '@/store';

interface NoteModel {
    note_id: string;
    alert_id: string;
    note: string;
    user_id: string;
    project_id: string;
    created_at: TimeStamp;
}

export default {
    name: 'AlertDetailNote',
    components: {
        PPaneLayout,
        PPanelTop,
        PTextarea,
        PButton,
        PCollapsibleList,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            noteInput: '',
            noteList: [] as NoteModel[],
            loading: true,
            timezone: computed(() => store.state.user.timezone),
            userId: computed(() => store.state.user.userId),
        });

        const apiQuery = new ApiQueryHelper();
        const listNote = async () => {
            try {
                state.loading = true;
                apiQuery.setFilters([{ k: 'alert_id', v: props.id, o: '=' }]);
                const res = await SpaceConnector.client.monitoring.note.list({
                    query: apiQuery.data,
                });
                state.noteList = res.results.map(d => ({
                    title: d.created_by,
                    data: d.note,
                    ...d,
                }));
            } catch (e) {
                console.error(e);
                state.noteList = [];
            } finally {
                state.loading = false;
            }
        };

        const createNote = async () => {
            try {
                await SpaceConnector.client.monitoring.note.create({
                    alert_id: props.id,
                    user_id: state.userId,
                    note: state.noteInput,
                });
            } catch (e) {
                console.error(e);
            } finally {
                state.noteInput = '';
                await listNote();
            }
        };

        (async () => {
            await listNote();
        })();


        return {
            ...toRefs(state),
            iso8601Formatter,
            createNote,
        };
    },
};


</script>

<style lang="postcss" scoped>
.alert-detail-note {
    padding-bottom: 2.5rem;
}
.note-wrapper {
    @apply px-4 flex flex-col;
    margin-top: 1.5rem;
    .author {
        @apply text-blue-900 font-bold;
        font-size: 0.875rem;
        line-height: 150%;
        margin-right: 0.25rem;
    }
    .date {
        @apply text-gray-400;
        font-size: 0.75rem;
        line-height: 150%;
    }
}
.add-btn {
    width: 6.125rem;
    margin-top: 0.5rem;
}
</style>
