import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Order from '../views/Order.vue'
import Cart from '../views/Cart.vue'
import UserLogin from '../views/UserLogin.vue'
import UserRegister from '../views/UserRegister.vue'
import UserOrders from '../views/UserOrders.vue'
import OrdersDebug from '../views/OrdersDebug.vue'
import Chat from '../views/Chat.vue'
import AdminLogin from '../views/AdminLogin.vue'
import AdminHome from '../views/AdminHome.vue'
import ProductAdmin from '../views/ProductAdmin.vue'
import OrderAdmin from '../views/OrderAdmin.vue'
import UserAdmin from '../views/UserAdmin.vue'
import ChatAdmin from '../views/ChatAdmin.vue'
import AppointmentAdmin from '../views/AppointmentAdmin.vue'
import ContractAdmin from '../views/ContractAdmin.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/order',
    name: 'Order',
    component: Order
  },
  // 用户登录路由
  {
    path: '/login',
    name: 'UserLogin',
    component: UserLogin
  },
  // 用户注册路由
  {
    path: '/register',
    name: 'UserRegister',
    component: UserRegister
  },
  // 用户订单历史
  {
    path: '/orders',
    name: 'UserOrders',
    component: UserOrders
  },
  // 订单调试页面
  {
    path: '/orders-debug',
    name: 'OrdersDebug',
    component: OrdersDebug
  },
  // 聊天页面
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  },
  // 管理后台路由
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin',
    name: 'AdminHome',
    component: AdminHome
  },
  {
    path: '/admin/products',
    name: 'ProductAdmin',
    component: ProductAdmin
  },
  {
    path: '/admin/orders',
    name: 'OrderAdmin',
    component: OrderAdmin
  },
  {
    path: '/admin/users',
    name: 'UserAdmin',
    component: UserAdmin
  },
  {
    path: '/admin/chat',
    name: 'ChatAdmin',
    component: ChatAdmin
  },
  {
    path: '/admin/appointments',
    name: 'AppointmentAdmin',
    component: AppointmentAdmin
  },
  {
    path: '/admin/contracts',
    name: 'ContractAdmin',
    component: ContractAdmin
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（例如浏览器前进/后退），返回到该位置
    if (savedPosition) {
      return savedPosition
    }
    // 否则滚动到页面顶部
    return { top: 0 }
  }
})

export default router 