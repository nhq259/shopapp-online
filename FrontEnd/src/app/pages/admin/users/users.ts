import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { NotificationService } from '../../../services/notifycation';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {

  users: any[] = [];

  search = '';
  page = 1;
  limit = 5;
  total = 0;

  loading = false;

  private searchSubject = new Subject<string>();

  constructor(
    private userService: UserService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(keyword => {
      this.page = 1;
      this.search = keyword;
      this.loadUsers();
    });
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers(this.search, this.page, this.limit).subscribe({
      next: (res) => {
        this.users = res.data;
        this.total = res.meta.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notify.error('Không thể tải danh sách người dùng');
      }
    });
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadUsers();
  }

  toggleStatus(user: any) {
    const msg =
      user.status === 'active'
        ? 'Ngừng hoạt động người dùng này?'
        : 'Kích hoạt lại người dùng này?';

    if (!confirm(msg)) return;

    this.userService.toggleUserStatus(user.id).subscribe({
      next: () => {
        user.status = user.status === 'active' ? 'inactive' : 'active';
        this.notify.success('Cập nhật trạng thái người dùng thành công');
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Không thể cập nhật trạng thái');
      }
    });
  }

  deleteUser(user: any) {
    if (!confirm('Xóa mềm người dùng này?')) return;

    this.userService.softDeleteUser(user.id).subscribe({
      next: () => {
        this.notify.success('Xóa mềm người dùng thành công');
        this.loadUsers();
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Không thể xóa người dùng');
      }
    });
  }
}
