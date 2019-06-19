const BaseHeader = () => import('@/components/base/BaseHeader')

const IdentityMain = () => import('./IdentityMain')
const IdentitySidebar = () => import('./IdentitySidebar')

const User = () => import('./user/User')
const Project = () => import('./project/Project')

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
    }
  ]
}
