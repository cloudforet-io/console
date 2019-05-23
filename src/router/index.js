import Vue from 'vue'
import Router from 'vue-router'

// Containers
const DefaultContainer = () => import('@/containers/DefaultContainer')

// Views
const SignIn = () => import('@/views/SignIn')
const Dashboard = () => import('@/views/Dashboard')
// const Users = () => import('@/views/Users')
const InfraLayers = () => import('@/views/InfraLayers')
const Projects = () => import('@/views/Projects')
const Networks = () => import('@/views/Networks')
const Assets = () => import('@/views/Assets')
const Servers = () => import('@/views/Servers')
const Plugins = () => import('@/views/Plugins')
const SupportCenter = () => import('@/views/SupportCenter')

// Views - Pages
const Page404 = () => import('@/views/pages/Page404')
const Page500 = () => import('@/views/pages/Page500')

// Users
const Users = () => import('@/components/users/Users')
const User = () => import('@/components/users/User')

Vue.use(Router)

export default new Router({
  mode: 'hash', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
      name: 'Home',
      component: DefaultContainer,
      children: [
        {
          path: 'sign-in',
          name: 'SignIn',
          component: SignIn
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: Dashboard
        },
        {
          path: 'infra-layers',
          name: 'InfraLayers',
          component: InfraLayers
        },
        {
          path: 'projects',
          name: 'Projects',
          component: Projects
        },
        {
          path: 'networks',
          name: 'Networks',
          component: Networks
        },
        {
          path: 'assets',
          name: 'Assets',
          component: Assets
        },
        {
          path: 'servers',
          name: 'Servers',
          component: Servers
        },
        {
          path: 'plugins',
          name: 'Plugins',
          component: Plugins
        },
        {
          path: 'support-center',
          name: 'SupportCenter',
          component: SupportCenter
        },
        {
          path: 'users',
          meta: { label: 'Users'},
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: '',
              component: Users,
            },
            {
              path: ':id',
              meta: { label: 'User Details'},
              name: 'User',
              component: User,
            },
          ]
        },
      ]
    }
  ]
})
