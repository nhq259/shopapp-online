import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService) {}

  /** ✅ Thành công */
  success(message: string, title = 'Thành công') {
    this.toastr.success(message, title);
  }

  /** ❌ Lỗi */
  error(message: string, title = 'Lỗi') {
    this.toastr.error(message, title);
  }

  /** ⚠️ Cảnh báo */
  warning(message: string, title = 'Cảnh báo') {
    this.toastr.warning(message, title);
  }

  /** ℹ️ Thông tin */
  info(message: string, title = 'Thông báo') {
    this.toastr.info(message, title);
  }
}
