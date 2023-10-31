import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { Company, User } from 'app/core/user/user.types';

@Injectable({
    providedIn: 'root'
})
export class UserService
{
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    private _company: ReplaySubject<Company> = new ReplaySubject<Company>(1);

    set user(value: User)
    {
        this._user.next(value);
    }

    get user$(): Observable<User>
    {
        return this._user.asObservable();
    }

    set company(value: Company)
    {
        this._company.next(value);
    }

    get company$(): Observable<Company>
    {
        return this._company.asObservable();
    }

    clear(){
        this.user = null;
        this.company = null;
    }
}
