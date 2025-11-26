import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../services/login';
import { CartService } from '../../services/cart';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginF: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  constructor(
    private loginService: LoginService,
    private cartService: CartService,
  ) {}

  onLogin(): void {
    if (this.loginF.invalid) return;

    this.loginService.login(this.loginF.value).subscribe({
      next: (res: any) => {

        // 1️⃣ lưu token + user
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.data));

        // 2️⃣ Đúng userId theo API trả về
        const userId = res.data.id;

        // 3️⃣ Tạo hoặc lấy cart
        this.cartService.createOrGetCart(userId).subscribe({
          next: (cartRes: any) => {
            localStorage.setItem("cart_id", cartRes.data.id);
            location.assign('/');
          },
          error: (err) => {
            console.error(err);
            alert("Không thể tạo giỏ hàng. Vui lòng thử lại.");
          }
        });

      },

      error: (err: any) => {
        alert(err.error.message || 'Đăng nhập thất bại');
      },
    });
  }
}
