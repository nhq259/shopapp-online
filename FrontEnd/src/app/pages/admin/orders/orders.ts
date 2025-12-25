import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../services/order';
import { ORDER_STATUS_CLASS, ORDER_STATUS_LABEL, OrderStatus } from '../../../constants/order-status';

@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {

  orders: any[] = [];

  search = '';
  status: OrderStatus | '' = '';
  page = 1;

  totalPages = 0;
  total = 0;
  loading = false;

   OrderStatus = OrderStatus;
  STATUS_LABEL = ORDER_STATUS_LABEL;
  STATUS_CLASS = ORDER_STATUS_CLASS;

  // MAP STATUS NUMBER -> ENUM STRING
STATUS_NUMBER_MAP: Record<number, OrderStatus> = {
  1: OrderStatus.PENDING,
  2: OrderStatus.PROCESSING,
  3: OrderStatus.SHIPPED,
  4: OrderStatus.DELIVERED,
  5: OrderStatus.CANCELED,
  6: OrderStatus.REFUND,
  7: OrderStatus.FAILED,
};

STATUS_ENUM_TO_NUMBER: Record<OrderStatus, number> = {
  [OrderStatus.PENDING]: 1,
  [OrderStatus.PROCESSING]: 2,
  [OrderStatus.SHIPPED]: 3,
  [OrderStatus.DELIVERED]: 4,
  [OrderStatus.CANCELED]: 5,
  [OrderStatus.REFUND]: 6,
  [OrderStatus.FAILED]: 7,
};

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
     const statusParam =
  this.status === ''
    ? undefined
    : this.STATUS_ENUM_TO_NUMBER[this.status as OrderStatus];
      
    this.orderService.getOrders(this.search, this.page, statusParam)
      .subscribe({
        next: (res) => {
          this.orders = res.data;
          this.page = res.currentPage;
          this.totalPages = res.totalPages;
          this.total = res.total;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  onSearchChange(value: string) {
    this.search = value;
    this.page = 1;
    this.loadOrders();
  }

  onStatusChange(value: OrderStatus | '') {
    this.status = value;
    this.page = 1;
    this.loadOrders();
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadOrders();
  }

  // deleteOrder(order: any) {
  //   if (!confirm('Xóa (soft delete) đơn hàng này?')) return;

  //   this.orderService.softDeleteOrder(order.id)
  //     .subscribe(() => {
  //       this.loadOrders();
  //     });
  // }

getStatusClass(status: number): string {
  const key = this.STATUS_NUMBER_MAP[status];
  return key ? this.STATUS_CLASS[key] : '';
}

getStatusLabel(status: number): string {
  const key = this.STATUS_NUMBER_MAP[status];
  return key ? this.STATUS_LABEL[key] : status.toString();
}


}
