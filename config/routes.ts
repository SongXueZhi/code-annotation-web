export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
          {
            name: 'register',
            path: '/user/register',
            component: './user/Register',
          },
          {
            name: 'register-result',
            path: '/user/register-result',
            component: './user/Register-result',
          },
        ],
      },
    ],
  },
  {
    key: 'regression',
    name: 'regression',
    icon: 'table',
    path: '/regression',
    component: './regression',
  },
  {
    key: 'editor',
    name: 'editor',
    path: '/editor',
    icon: 'smile',
    component: './editor',
  },
  // {
  //   name: 'code',
  //   path: '/code',
  //   icon: 'smile',
  //   component: './diff',
  // },

  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './404',
  },
];
