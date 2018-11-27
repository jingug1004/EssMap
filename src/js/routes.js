import HomePage from '@/pages/home.vue';
import NotFoundPage from '@/pages/not-found.vue';

import PanelLeftPage from '@/pages/panel-left.vue';
import LoginPage from '@/pages/login.vue';
import MenuPage from '@/pages/popup-menus.vue';
import MenuDetailPage from '@/pages/popup-menu-detail.vue';
import TermsPage from '@/pages/join/terms.vue';
import JoinFormPage from '@/pages/join/form.vue';
import UserPage from '@/pages/user.vue';
import TrekCourseListPage from '@/pages/trekCourseList.vue';
import TrekCourseHistoryPage from '@/pages/trekCourseHistory.vue';
import LoadingPage from '@/pages/loading.vue';

export default [
  {
    path: '/Home', component: HomePage,
  },{
    path: '/panel-left/', component: PanelLeftPage,
  },{
    //이건 query로
    //path: '/menus', component: MenuPage, props: (route) => ({ query: route.query.q })
    // 이건 param으로
    path: '/menus/:cid', component: MenuPage,
  },{
    path: '/menuDetail/:pid', component: MenuDetailPage,
  },{
    path: '/login/', component: LoginPage,
  // },{
  //   path: '/dynamic-route/blog/:blogId/post/:postId/', component: DynamicRoutePage,
  },{
    path: '/terms', component: TermsPage,
  },{
    path: '/joinForm', component: JoinFormPage,
  },{
    path: '/user', component: UserPage,
  },{
    path: '/trekCourseList', component: TrekCourseListPage,
  },{
    path: '/trekCourseHistory/:tcid', component: TrekCourseHistoryPage,
  },{
    path: '/loading', component: LoadingPage,
  },{
    path: '(.*)', component: NotFoundPage,
  },
];
