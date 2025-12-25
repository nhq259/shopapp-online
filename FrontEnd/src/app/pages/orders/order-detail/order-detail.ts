import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../services/order';
import { NotificationService } from '../../../services/notifycation';

@Component({
  selector: 'app-order-detail',
  standalone: false,
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.css']
})
export class OrderDetail implements OnInit {

  orderId = 0;
  order: any = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private notify: NotificationService
    
  ) {}

  ngOnInit() {
    this.orderId = Number(this.route.snapshot.paramMap.get("id"));
    this.loadOrder();
  }

  loadOrder() {
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (res) => {
        this.order = res.data;
      },
      error: () => {
        this.notify.error("Không thể tải chi tiết đơn hàng");
      }
    });
  }

  formatVND(v: number) {
    return v.toLocaleString("vi-VN") + " ₫";
  }
  getStatusName(status: number): string {
  switch (status) {
    case 1: return "Pending";
    case 2: return "Processing";
    case 3: return "Shipped";
    case 4: return "Delivered";
    case 5: return "Canceled";
    case 6: return "Refund";
    case 7: return "Failed";
    default: return "Unknown";
  }
}

getStatusClass(status: number): string {
  switch (status) {
    case 1: return "badge badge-warning";
    case 2: return "badge badge-info";
    case 3: return "badge badge-primary";
    case 4: return "badge badge-success";
    case 5: return "badge badge-secondary";
    case 6: return "badge badge-dark";
    case 7: return "badge badge-danger";
    default: return "badge badge-light";
  }
}

canCancel(): boolean {
  return this.order && (this.order.status === 1 || this.order.status === 2);
}

cancelOrder() {
  if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

  this.orderService.cancelOrder(this.order.id).subscribe({
    next: (res) => {
      // backend trả về order đã update status = CANCELED (5)
      this.order.status = res.data.status;
      this.notify.success('Đơn hàng đã được hủy thành công');
    },
    error: (err) => {
      this.notify.error(err.error?.message || 'Không thể hủy đơn hàng');
    }
  });
}


}
