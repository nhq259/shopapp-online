import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {

  users: any[] = [];

  // search & paging
  search: string = '';
  page: number = 1;
  limit: number = 5;
  total: number = 0;

  loading = false;
   // 🔥 realtime search stream
  private searchSubject = new Subject<string>();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();

     // 🔥 debounce realtime search
    this.searchSubject.pipe(
      debounceTime(400),          // đợi 400ms sau khi ngừng gõ
      distinctUntilChanged()      // chỉ search nếu khác giá trị trước
    ).subscribe(keyword => {
      this.page = 1;
      this.search = keyword;
      this.loadUsers();
    });
  }

  loadUsers() {
    this.loading = true;
    this.userService
      .getAllUsers(this.search, this.page, this.limit)
      .subscribe({
        next: (res) => {
          this.users = res.data;
          this.total = res.meta.total;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

   // 🔥 gọi mỗi khi user gõ
  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  onSearch() {
    this.page = 1;
    this.loadUsers();
  }

  // ===== PAGINATION =====
  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadUsers();
  }

  // ===== CLICK BADGE TO TOGGLE STATUS =====
  toggleStatus(user: any) {
    if (!confirm(`Đổi trạng thái người dùng này?`)) return;

    this.userService.toggleUserStatus(user.id)
      .subscribe(() => {
        user.status = user.status === 'active' ? 'inactive' : 'active';
      });
  }

  deleteUser(user: any) {
    if (!confirm('Xóa mềm người dùng này?')) return;

    this.userService.softDeleteUser(user.id)
      .subscribe(() => {
        this.loadUsers();
      });
  }
}
