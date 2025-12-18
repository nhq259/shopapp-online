import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate():
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {

    const raw = localStorage.getItem('user');
    if (!raw) {
      return this.router.parseUrl('/login');
    }

    try {
      const user = JSON.parse(raw);
      // bạn nói role: user = 1, admin = 2
      if (user.role === 2) {
        return true;
      }
      alert('Bạn không có quyền truy cập trang quản trị');
      return this.router.parseUrl('/');
    } catch {
      return this.router.parseUrl('/login');
    }
  }
}
