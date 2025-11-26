// import { Injectable } from '@angular/core';
// import {
//   HttpInterceptor,
//   HttpRequest,
//   HttpHandler,
//   HttpEvent,
//   HttpErrorResponse
// } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

//     const token = localStorage.getItem('token');

//     // ===========================================================
//     // DANH SÁCH API CẦN TOKEN (chỉ POST/PUT/DELETE yêu cầu login)
//     // ===========================================================
//     const securedEndpoints = [
//       { url: '/cart-items', methods: ['POST', 'PUT', 'DELETE'] },
//       { url: '/carts', methods: ['POST', 'PUT', 'DELETE'] },
//       { url: '/carts/checkout', methods: ['POST'] },
//       { url: '/orders', methods: ['GET', 'POST'] }
//     ];

//     let needAuth = false;

//     // Duyệt danh sách endpoint để biết request này có cần token không
//     for (const api of securedEndpoints) {
//       if (req.url.includes(api.url) && api.methods.includes(req.method)) {
//         needAuth = true;
//         break;
//       }
//     }

//     // Nếu không cần token → return luôn
//     if (!needAuth) {
//       return next.handle(req);
//     }

//     // Nếu cần token → nhưng FE chưa có token
//     if (!token) {
//       console.warn("⚠ Request cần token nhưng FE không có token");
//       return throwError(() =>
//         new HttpErrorResponse({
//           status: 401,
//           statusText: "TOKEN_MISSING",
//           error: { message: "Thiếu token" }
//         })
//       );
//     }

//     // Gắn token vào request
//     const authReq = req.clone({
//       setHeaders: { Authorization: `Bearer ${token}` }
//     });

//     // Xử lý lỗi 401
//     return next.handle(authReq).pipe(
//       catchError((err: HttpErrorResponse) => {
//         if (err.status === 401) {
//           console.warn("Token hết hạn → auto logout");

//           localStorage.removeItem('token');
//           localStorage.removeItem('user');
//           localStorage.removeItem('cart_id');

//           location.assign('/login');
//         }
//         return throwError(() => err);
//       })
//     );
//   }
// }
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = localStorage.getItem('token');

    let newReq = req;

    // 🔹 Nếu có token → chỉ lúc đó mới gắn Authorization
    if (token) {
      newReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // 🔹 Không token → giữ nguyên request (cho phép public APIs chạy bình thường)
    return next.handle(newReq).pipe(
      catchError((error: HttpErrorResponse) => {

        // Token hết hạn → xoá token và cho logout
        if (error.status === 401) {
          console.warn('Token hết hạn hoặc không hợp lệ → tự động logout');

          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('cart_id');

          // reload trang để about intercept loop
          location.assign('/login');
        }

        return throwError(() => error);
      })
    );
  }
}
