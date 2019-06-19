import Vue from 'vue'
import Router from 'vue-router'
import cookie from 'vue-cookie'

import { loadLanguageAsync } from '@/setup/i18n'
import store from '@/store'

// Services
import dashboardRoute from '@/services/dashboard/dashboardRoute'
import identityRoute from '@/services/identity/identityRoute'
import inventoryRoute from '@/services/inventory/inventoryRoute'

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
      meta: { label: 'Sign In', requiresAuth: false },
      component: SignIn
    },
    {
      path: '/',
      name: 'home',
      redirect: '/dashboard',
      component: DefaultContainer,
      children: [
        dashboardRoute,
        identityRoute,
        inventoryRoute
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  for (var i = to.matched.length - 1; i > -1; i--) {
    if (to.matched[i].meta.requiresAuth) {
      if (cookie.get('sessionId')) next()
      else {
        store.dispatch('auth/setNextPath', { nextPath: to.fullPath })
        next({
          path: '/sign-in'
        })
      }
      return
    }
  }
  next()
})

export default router
