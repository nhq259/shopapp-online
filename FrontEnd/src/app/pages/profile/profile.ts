import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  user: any = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    const stored = localStorage.getItem("user");

    if (!stored) {
      alert("Bạn cần đăng nhập!");
      this.router.navigate(['/login']);
      return;
    }

    const parsed = JSON.parse(stored);
    const userId = parsed.id;

    this.getUser(userId);
  }

  getUser(id: number) {
    this.userService.getUserById(id).subscribe({
      next: (res: any) => {
        this.user = res.data;
      },
      error: (err) => {
        console.error("Load user error:", err);
        alert("Không thể tải thông tin người dùng!");
      }
    });
  }

  goToEdit() {
    this.router.navigate(['/profile/edit']);
  }


}
