<template>
  <AppSidebar fixed>
    <SidebarHeader/>
    <SidebarForm/>
      <SidebarNav :navItems="nav"></SidebarNav>
    <SidebarFooter/>
    <SidebarMinimizer/>
  </AppSidebar>
</template>

<script>
import { mapState } from 'vuex'
import { Sidebar as AppSidebar, SidebarFooter, SidebarForm, SidebarHeader, SidebarMinimizer, SidebarNav } from '@coreui/vue'

  export default {
    components: {
      AppSidebar,
      SidebarForm,
      SidebarFooter,
      SidebarHeader,
      SidebarNav,
      SidebarMinimizer
    },
    computed: {
    },
    data() {
      return {
        nav: [
          {
            attributes: {
              disabled: true
            }
          },
          {
            "title": true,
            "name": "Theme",
          },
          {
            "name": "Colors",
            "url": "/theme/colors",
            "icon": "icon-drop"
          },
          {
            "name": "Typography",
            "url": "/theme/typography",
            "icon": "icon-pencil"
          },
          {
            "title": true,
            "name": "Components",
          },
          {
            "name": "Base",
            "url": "/base",
            "icon": "icon-puzzle",
            "children": [
              {
                "name": "Tooltips",
                "url": "/base/tooltips",
                "icon": "icon-puzzle",
                "children": [
                  {
                    "name": "abc",
                    "url": "/base/tooltips/abc",
                    "icon": "icon-puzzle"
                  }
                ]
              }
            ]
          },
        ]
      }
    },
  }
</script>

<style lang="scss" scoped>

</style>