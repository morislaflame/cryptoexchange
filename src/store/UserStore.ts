import {makeAutoObservable, runInAction } from "mobx";
import { fetchMyInfo, telegramAuth, check, login, registration } from "@/http/userAPI";
import { type UserInfo } from "@/types/types";

export default class UserStore {
    _user: UserInfo | null = null;
    _isAuth = false;
    _users: UserInfo[] = [];
    _loading = false;
    isTooManyRequests = false;
    isServerError = false;
    serverErrorMessage = '';

    constructor() {
        makeAutoObservable(this);
    }

    setIsAuth(bool: boolean) {
        this._isAuth = bool;
    }

    setUser(user: UserInfo | null) {
        this._user = user;
    }

    setUsers(users: UserInfo[]) {
        this._users = users;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setTooManyRequests(flag: boolean) {
        this.isTooManyRequests = flag;
    }

    setServerError(flag: boolean, message: string = '') {
        this.isServerError = flag;
        this.serverErrorMessage = message;
    }

    async logout() {
        try {
            this.setIsAuth(false);
            this.setUser(null);
            localStorage.removeItem('token');
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }

    async telegramLogin(initData: string) {
        try {
            const data = await telegramAuth(initData);
            runInAction(() => {
                this.setUser(data as UserInfo);
                this.setIsAuth(true);
                this.setServerError(false);
            });
        } catch (error) {
            console.error("Error during Telegram authentication:", error);
            this.setServerError(true, 'Server is not responding. Please try again later.');
        }
    }
    
    async checkAuth() {
        try {
            const data = await check();
            runInAction(() => {
                this.setUser(data as UserInfo);
                this.setIsAuth(true);
                this.setServerError(false);
            });
        } catch (error) {
            console.error("Error during auth check:", error);
            runInAction(() => {
                this.setIsAuth(false);
                this.setUser(null);
                this.setServerError(true, 'Server is not responding. Please try again later.');
            });
        }
    }

    async fetchMyInfo() {
        try {
            const data = await fetchMyInfo();
            runInAction(() => {
                this.setUser(data as UserInfo);
            });
            
        } catch (error) {
            console.error("Error during fetching my info:", error);
        }
    }

    async login(email: string, password: string) {
        try {
            await login(email, password);
            // После успешного логина загружаем полную информацию о пользователе
            await this.fetchMyInfo();
            runInAction(() => {
                this.setIsAuth(true);
                this.setServerError(false);
            });
        } catch (error: unknown) {
            console.error("Error during login:", error);
            this.setServerError(true, (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка входа');
            throw error;
        }
    }

    async registration(email: string, password: string) {
        try {
            await registration(email, password);
            // После успешной регистрации загружаем полную информацию о пользователе
            await this.fetchMyInfo();
            runInAction(() => {
                this.setIsAuth(true);
                this.setServerError(false);
            });
        } catch (error: unknown) {
            console.error("Error during registration:", error);
            this.setServerError(true, (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка регистрации');
            throw error;
        }
    }

    get users() {
        return this._users;
    }

    get isAuth() {
        return this._isAuth
    }

    get user() {
        return this._user
    }

    get loading() {
        return this._loading;
    }
    
}
