const BaseHeader = () => import('@/container/header/CTHD_001_Header')

const IdentityMain = () => import('./IDNT_001_IdentityMain')
const IdentitySidebar = () => import('./IDNT_002_IdentitySidebar')

const User = () => import('./user/IDUS_001_User')
const Project = () => import('./project/IDPJ_001_Project')

export default {
  path: 'identity',
  name: 'identity',
  redirect: '/identity/project',
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
