import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../../services/order';
import {
  ORDER_STATUS_CLASS,
  ORDER_STATUS_LABEL,
  OrderStatus,
} from '../../../../constants/order-status';
import { NotificationService } from '../../../../services/notifycation';

@Component({
  selector: 'app-order-detail',
  standalone: false,
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
})
export class OrderDetail implements OnInit {
  order: any;
  loading = false;
  previousStatus!: number;

  STATUS_LABEL = ORDER_STATUS_LABEL;
  STATUS_CLASS = ORDER_STATUS_CLASS;

  // number -> enum
  STATUS_NUMBER_TO_ENUM: Record<number, OrderStatus> = {
    1: OrderStatus.PENDING,
    2: OrderStatus.PROCESSING,
    3: OrderStatus.SHIPPED,
    4: OrderStatus.DELIVERED,
    5: OrderStatus.CANCELED,
    6: OrderStatus.REFUND,
    7: OrderStatus.FAILED,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadOrder(id);
    }
  }

  loadOrder(id: number) {
    this.loading = true;
    this.orderService.getOrderById(id).subscribe({
      next: (res) => {
        this.order = res.data;
        this.previousStatus = this.order.status;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notify.error('Không thể tải chi tiết đơn hàng');
      },
    });
  }

  /** ✅ ADMIN UPDATE STATUS */
  updateStatus(newStatus: number) {
    if (!confirm('Cập nhật trạng thái đơn hàng?')) {
      // ❌ Người dùng hủy → rollback
      this.order.status = this.previousStatus;
      return;
    }

    this.orderService
      .updateOrderStatus(this.order.id, {
        status: newStatus,
      })
      .subscribe({
        next: (res) => {
          this.order.status = res.data.status;
          this.previousStatus = res.data.status; // ✅ CẬP NHẬT MỐC MỚI
          this.notify.success('Cập nhật trạng thái đơn hàng thành công');
        },
        error: (err) => {
          this.order.status = this.previousStatus;

          this.notify.error(
            err.error?.message || 'Không thể cập nhật trạng thái'
          );
        },
      });
  }

  cancelOrder() {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    this.orderService.cancelOrder(this.order.id).subscribe({
      next: (res) => {
        this.order.status = res.data.status; // = 5 (CANCELED)
        this.notify.success('Đơn hàng đã được hủy');
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Không thể hủy đơn hàng');
      },
    });
  }

  onStatusSelectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = Number(select.value);

    // Không gọi API nếu không đổi
    if (newStatus === this.order.status) return;

    this.updateStatus(newStatus);
  }

  getStatusClass(status: number): string {
    const key = this.STATUS_NUMBER_TO_ENUM[status];
    return key ? this.STATUS_CLASS[key] : '';
  }

  getStatusLabel(status: number): string {
    const key = this.STATUS_NUMBER_TO_ENUM[status];
    return key ? this.STATUS_LABEL[key] : status.toString();
  }

  back() {
    this.router.navigate(['/admin/orders']);
  }
}
