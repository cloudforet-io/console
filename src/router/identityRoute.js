const BaseHeader = () => import('@/components/base/BaseHeader')

const IdentityMain = () => import('@/services/identity/IdentityMain')
const IdentitySidebar = () => import('@/services/identity/IdentitySidebar')

const Domain = () => import('@/services/identity/Domain')
const User = () => import('@/services/identity/User')
const Project = () => import('@/services/identity/Project')
const APIKey = () => import('@/services/identity/APIKey')

export default {
  path: 'identity',
  name: 'identity',
  redirect: '/identity/domain',
  meta: { label: 'Identity', requiresAuth: true },
  components: {
    header: BaseHeader,
    sidebar: IdentitySidebar,
    main: IdentityMain
  },
  children: [
    {
      path: 'domain',
      name: 'domain',
      meta: { label: 'Domain', requiresAuth: true },
      component: Domain
    },
    {
      path: 'project',
      name: 'project',
      meta: { label: 'Project', requiresAuth: true },
      component: Project
    },
    {
      path: 'user',
      name: 'user',
      meta: { label: 'User', requiresAuth: true },
      component: User
    },
    {
      path: 'api-key',
      name: 'apiKey',
      meta: { label: 'API Key', requiresAuth: true },
      component: APIKey
    }
  ]
}
