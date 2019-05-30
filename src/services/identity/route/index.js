const BaseHeader = () => import('@/components/base/BaseHeader')

const IdentityMain = () => import('@/services/identity/views/IdentityMain')
const IdentitySidebar = () => import('@/services/identity/views/IdentitySidebar')

const Domain = () => import('@/services/identity/views/Domain')
const User = () => import('@/services/identity/views/User')
const Project = () => import('@/services/identity/views/Project')
const APIKey = () => import('@/services/identity/views/APIKey')

export default {
  path: 'identity',
  name: 'identity',
  redirect: '/identity/domain',
  meta: { label: 'Identity' },
  components: {
    header: BaseHeader,
    sidebar: IdentitySidebar,
    main: IdentityMain
  },
  children: [
    {
      path: 'domain',
      name: 'domain',
      meta: { label: 'Domain' },
      component: Domain
    },
    {
      path: 'project',
      name: 'project',
      meta: { label: 'Project' },
      component: Project
    },
    {
      path: 'user',
      name: 'user',
      meta: { label: 'User' },
      component: User
    },
    {
      path: 'api-key',
      name: 'apiKey',
      meta: { label: 'API Key' },
      component: APIKey
    }
  ]
}
