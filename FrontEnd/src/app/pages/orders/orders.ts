import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class Orders implements OnInit {

  userId = 0;
  orders: any[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    this.userId = user.id;

    if (!this.userId) return;

    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrdersByUser(this.userId).subscribe({
      next: (res) => {
        this.orders = res.data || [];
      },
      error: () => {
        alert("Không thể tải danh sách đơn hàng");
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

}
