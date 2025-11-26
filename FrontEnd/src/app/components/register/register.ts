import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../services/login'; // hoặc RegisterService nếu bạn tách riêng

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerF: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [
      Validators.pattern(/^0\d{9}$/)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  constructor(private loginService: LoginService) {} // hoặc RegisterService

  onRegister(): void {
    if (this.registerF.invalid) return;

    const { email, phone, password, confirmPassword } = this.registerF.value;

    if (
      password !== confirmPassword
    ) {
      alert('Mật khẩu không khớp!');
      return;
    }

    const body = {
      name: this.registerF.value.name,
      email,
      phone,
      password,
    };

    this.loginService.register(body).subscribe({
      next: (res: any) => {
        alert('Đăng ký thành công. Vui lòng đăng nhập');
        location.assign('/login');
      },
      error: (err: any) => {
        if (err.status === 400) {
          alert(err.error.message || 'Thông tin đăng ký không hợp lệ.');
        } else {
          alert('Đã xảy ra lỗi, vui lòng thử lại sau.');
        }
      },
    });
  }
}
