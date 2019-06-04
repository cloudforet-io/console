import Vue from 'vue'
import Router from 'vue-router'
import cookie from 'vue-cookie'
import store from '@/store'

// Services
import dashboardRoute from './dashboardRoute'
import identityRoute from './identityRoute'
import inventoryRoute from './inventoryRoute'
import pluginRoute from './pluginRoute'

import { loadLanguageAsync } from '@/setup/i18n'

// Containers
const DefaultContainer = () => import('@/containers/DefaultContainer')

// Views
const SignIn = () => import('@/views/SignIn')

const attatchLangauge = (to, from, next) => {
  if (!to.params.lang) {
    next()
    return
  }
  const lang = to.params.lang
  loadLanguageAsync(lang).then(() => next())

  next()
}

Vue.use(Router)

const router = new Router({
  mode: 'history',
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/sign-in',
      name: 'signIn',
      meta: { label: 'Sign In' },
      component: SignIn,
      beforeEnter: (to, from, next) => {
        if (cookie.get('accessToken')) next('/dashboard')
        else next()
      }
    },
    {
      path: '/',
      name: 'home',
      component: DefaultContainer,
      beforeEnter: (to, from, next) => {
        console.log('check auth')
        if (!cookie.get('accessToken')) next('/sign-in')
        else next()
      },
      children: [
        dashboardRoute,
        identityRoute,
        inventoryRoute,
        pluginRoute
      ]
    }
  ]
})

export default router
