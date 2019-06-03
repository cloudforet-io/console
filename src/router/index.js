import Vue from 'vue'
import Router from 'vue-router'

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

Vue.use(Router)

const router = new Router({
  mode: 'history',
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
      name: 'home',
      component: DefaultContainer,
      beforeEnter: (to, from, next) => {
        if (!to.params.lang) {
          next()
          return
        }
        const lang = to.params.lang
        loadLanguageAsync(lang).then(() => next())

        next()
      },
      children: [
        {
          path: 'sign-in',
          name: 'signIn',
          meta: { label: 'Sign In' },
          components: {
            main: SignIn
          }
        },
        dashboardRoute,
        identityRoute,
        inventoryRoute,
        pluginRoute
      ]
    }
  ]
})

export default router
