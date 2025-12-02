import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../services/order';

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
    private orderService: OrderService
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
        alert("Không thể tải chi tiết đơn hàng");
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
