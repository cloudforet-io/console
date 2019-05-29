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

// Views - Pages
const Page404 = () => import('@/views/pages/Page404')
const Page500 = () => import('@/views/pages/Page500')

// Users
const Users = () => import('@/components/users/Users')
const User = () => import('@/components/users/User')

Vue.use(Router)

import {loadLanguageAsync} from '@/setup/i18n'
import store from '@/store'

const router = new Router({
  mode: 'history', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
      name: 'home',
      meta: { label: 'Home' },
      component: DefaultContainer,
      beforeEnter: (to, from, next) => {
        if(!to.params.lang) {
          next();
          return;
        }
        const lang = to.params.lang
        loadLanguageAsync(lang).then(() => next())
      },
      children: [
        {
          path: 'sign-in',
          name: 'signIn',
          meta: { label: 'Sign In'},
          component: SignIn
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          meta: { label: 'Dashboard'},
          component: Dashboard
        },
        {
          path: 'infra-layers',
          name: 'infraLayers',
          meta: { label: 'Infra Layers'},
          component: InfraLayers
        },
        {
          path: 'projects',
          name: 'projects',
          meta: { label: 'Projects'},
          component: Projects
        },
        {
          path: 'networks',
          name: 'networks',
          meta: { label: 'Networks'},
          component: Networks
        },
        {
          path: 'assets',
          name: 'assets',
          meta: { label: 'Assets'},
          component: Assets
        },
        {
          path: 'servers',
          name: 'servers',
          meta: { label: 'Servers'},
          component: Servers
        },
        {
          path: 'plugins',
          name: 'plugins',
          meta: { label: 'Plugins'},
          component: Plugins
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
              name: 'users',
              component: Users,
            },
            {
              path: ':id',
              meta: { label: 'User Details'},
              name: 'user',
              component: User,
            },
          ]
        },
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.name === 'dashboard') store.dispatch('nav/hideNav')
  else store.dispatch('nav/showNav')
  next()
})

export default router;
