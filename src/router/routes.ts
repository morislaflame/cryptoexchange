// src/routes.ts (если у вас массив роутов)
import type { ComponentType } from 'react';
import MainPage from '@/pages/MainPage';
import AdminChatsPage from '@/pages/AdminChatsPage';
import AdminExchangesPage from '@/pages/AdminExchangesPage';
import RulesPage from '@/pages/RulesPage';
import AmlPage from '@/pages/AmlPage';
import FaqPage from '@/pages/FaqPage';
import AuthPage from '@/pages/AuthPage';
import ProfilePage from '@/pages/ProfilePage';
import { MAIN_ROUTE, ADMIN_CHATS_ROUTE, ADMIN_EXCHANGES_ROUTE, RULES_ROUTE, AML_ROUTE, FAQ_ROUTE, LOGIN_ROUTE, REGISTRATION_ROUTE, PROFILE_ROUTE } from '@/utils/consts';

interface Route {
  path: string;
  Component: ComponentType;
  role?: 'ADMIN' | 'USER';
}

export const publicRoutes: Route[] = [
  { path: MAIN_ROUTE, Component: MainPage },
  { path: RULES_ROUTE, Component: RulesPage },
  { path: AML_ROUTE, Component: AmlPage },
  { path: FAQ_ROUTE, Component: FaqPage },
  { path: LOGIN_ROUTE, Component: AuthPage },
  { path: REGISTRATION_ROUTE, Component: AuthPage },
];

export const privateRoutes: Route[] = [
  { path: PROFILE_ROUTE, Component: ProfilePage },
];

export const adminRoutes: Route[] = [
  { path: ADMIN_CHATS_ROUTE, Component: AdminChatsPage, role: 'ADMIN' },
  { path: ADMIN_EXCHANGES_ROUTE, Component: AdminExchangesPage, role: 'ADMIN' },
];
