import { api } from '@/setup/api'

const getValues = async () => {
  let res
  try {
    res = await api.get('identity/users')
  } catch (e) {
    console.error(e)
  }
  return res.data.map(user => user.name)
}

export default [
  { label: 'ID' },
  { label: 'Name' },
  { label: 'Group Name' },
  { label: 'Language', list: ['ko', 'en'] },
  { label: 'Domain ID', ajax: getValues }
]
