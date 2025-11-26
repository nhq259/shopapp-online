import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user';

@Component({
  selector: 'app-edit-profile',
  standalone: false,
  templateUrl: './edit-profile.html',
  styleUrls: ['./edit-profile.css']
})
export class EditProfile implements OnInit {

  userId = 0;
  user: any = {};

  name = '';
  avatar = '';

  old_password = '';
  new_password = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    this.userId = u.id;

    this.loadUser();
  }

  loadUser() {
    this.userService.getUserById(this.userId).subscribe({
      next: (res: any) => {
        this.user = res.data;
        this.name = this.user.name;
        this.avatar = this.user.avatar;
      },
      error: (err) => {
        alert("Không thể tải thông tin người dùng");
      }
    });
  }

  /** GỬI UPDATE USER */
  saveProfile() {

    const body: any = {};

    // chỉ gửi field BE cho phép
    if (this.name) body.name = this.name;
    if (this.avatar) body.avatar = this.avatar;

    // Nếu đổi mật khẩu → BE yêu cầu old_password + new_password
    if (this.new_password) {
      if (!this.old_password) {
        alert("Bạn phải nhập mật khẩu cũ để đổi mật khẩu!");
        return;
      }

      body.old_password = this.old_password;
      body.new_password = this.new_password;
    }

    this.userService.updateUser(this.userId, body).subscribe({
      next: (res: any) => {
        // 🔥 Nếu đổi mật khẩu → buộc logout
    if (this.new_password) {
      alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("cart_id");

      location.assign('/login')
      return;
    }
        alert("Cập nhật thành công!");

        // cập nhật lại localStorage
        localStorage.setItem("user", JSON.stringify(res.data));

        this.router.navigate(['/profile']);
      },
      error: (err) => {
        console.error(err);

        if (err.error?.fields) {
          alert("Lỗi: Các trường không được phép cập nhật: " + err.error.fields.join(", "));
        } else {
          alert(err.error?.message || "Cập nhật thất bại!");
        }
      }
    });
  }
}
