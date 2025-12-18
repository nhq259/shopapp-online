import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user';

@Component({
  selector: 'app-user-detail',
  standalone: false,
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css',
})
export class UserDetail implements OnInit {

  user: any;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadUser(id);
    }
  }

  loadUser(id: number) {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (res: any) => {
        this.user = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleStatus() {
    if (!confirm('Đổi trạng thái người dùng này?')) return;

    this.userService.toggleUserStatus(this.user.id)
      .subscribe(() => {
        this.user.status =
          this.user.status === 'active' ? 'inactive' : 'active';
      });
  }

  deleteUser() {
    if (!confirm('Xóa mềm người dùng này?')) return;

    this.userService.softDeleteUser(this.user.id)
      .subscribe(() => {
        this.router.navigate(['/admin/users']);
      });
  }

  back() {
    this.router.navigate(['/admin/users']);
  }
}
