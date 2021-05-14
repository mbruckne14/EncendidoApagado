import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '@app/_models';


@Injectable({ providedIn: 'root' })
export class AccountService {
    private userSubject: BehaviorSubject<User>;
    public user: Observable<User>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): User {
        return this.userSubject.value;
    }

    login(username, password) {
        return this.http.post<User>(`${environment.apiUrl}/login`, { username, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                if (user.mensaje == "Aprovado") {
                    localStorage.setItem('user', JSON.stringify(user.username));
                    localStorage.setItem('token', JSON.stringify(user.token));
                    this.userSubject.next(user);
                }
                return user;
            }));
    }

    changePassword(username, password, newpassword) {
        return this.http.post<User>(`${environment.apiUrl}/changepassword`, { username, password, newpassword })
            .pipe(map(user => {
                return user;
            }));
    }
    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.userSubject.next(null);
        this.router.navigate(['/account/login']);
    }


    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/users`);
    }

    getById(id: string) {
        return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
    }



    startResources(tagName: string, tagValue: string) {
        if (!tagName && !tagValue) {
            return this.http.get(`${environment.apiUrl}/start/`);
        }
        else {
            const body = { tagName, tagValue }
            return this.http.post<any>(`${environment.apiUrl}/start/`, body);
        }
    }
    stopResources(tagName: string, tagValue: string) {

        if (!tagName && !tagValue) {
            return this.http.get(`${environment.apiUrl}/stop/`);
        }
        else {
            const body = { tagName, tagValue }
            return this.http.post<any>(`${environment.apiUrl}/stop/`, body);
        }
    }

    getSchedule() {
        return this.http.get<any>(`${environment.apiUrl}/schedule/`);
    }

    scheduleResources(timeEncendido, timeApagado, diasEncendido, diasApagado, target) {
        const body = { timeEncendido, timeApagado, diasEncendido, diasApagado }
        if (target === "habilitar") {
            return this.http.post<any>(`${environment.apiUrl}/enable/`, body);
        }
        else {
            return this.http.post<any>(`${environment.apiUrl}/disable/`, body);
        }

    }
}