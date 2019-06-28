import { api } from '@/setup/api'

export default [
  { label: 'ID', values: ['wanz91', 'johny8989'] },
  { label: 'Name', values: ['Wanjin', 'John'] },
  { label: 'Group Name' },
  { label: 'Language', values: ['ko', 'en'] },
  { label: 'Domain ID', ajax: { url: '/identity/users', params: null, method: 'GET' } }
]
