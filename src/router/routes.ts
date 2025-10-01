// src/routes.ts (если у вас массив роутов)
import type { ComponentType } from 'react';
import MainPage from '@/pages/MainPage';
import AdminChatsPage from '@/pages/AdminChatsPage';
import { MAIN_ROUTE, ADMIN_CHATS_ROUTE } from '@/utils/consts';

interface Route {
  path: string;
  Component: ComponentType;
  role?: 'ADMIN' | 'USER';
}

export const publicRoutes: Route[] = [
  { path: MAIN_ROUTE, Component: MainPage },
];

export const privateRoutes: Route[] = [
  // Для авторизованных пользователей - позже добавим личный кабинет и т.д.
];

export const adminRoutes: Route[] = [
  { path: ADMIN_CHATS_ROUTE, Component: AdminChatsPage, role: 'ADMIN' },
];
