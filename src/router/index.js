import Vue from 'vue'
import Router from 'vue-router'
import Upload from '@/components/Upload'
import Login from '@/components/Login'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/upload',
      name: 'Upload',
      component: Upload
    }
  ]
})
