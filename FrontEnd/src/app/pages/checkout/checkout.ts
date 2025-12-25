import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart';
import { NotificationService } from '../../services/notifycation';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
})
export class Checkout implements OnInit {
  cart_id = Number(localStorage.getItem('cart_id'));
  items: any[] = [];
  total = 0;

  firstName = '';
  lastName = '';
  phone = '';
  address = '';
  note = '';

  constructor(private cartService: CartService,
        private notify: NotificationService
  ) {}

  ngOnInit() {
    this.cartService.getCartById(this.cart_id).subscribe((res) => {
      this.items = res.data.CartItems || [];
      this.total = this.items.reduce(
        (s, i) => s + i.quantity * i.Product.price,
        0
      );
    });
  }

  formatVND(v: number) {
    return v.toLocaleString('vi-VN') + ' ₫';
  }

  placeOrder() {
    if (!this.phone || !this.address) {
      this.notify.info('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const fullNote =
      `${this.firstName} ${this.lastName}`.trim() +
      (this.note ? ` - ${this.note}` : '');

    const body = {
      cart_id: this.cart_id,
      phone: this.phone,
      address: this.address,
      note: fullNote, // <-- gửi đúng chuẩn backend
    };

    this.cartService.checkout(body).subscribe({
      next: (res: any) => {
        alert('Thanh toán thành công!');
        // 🔥 Tạo giỏ hàng mới sau khi checkout
      this.createNewCart();
        // localStorage.removeItem('cart_id');
        // window.location.href = '/';
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Checkout thất bại');
      },
    });
  }

  createNewCart() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;

  this.cartService.createOrGetCart(userId).subscribe({
    next: (cartRes: any) => {
      localStorage.setItem("cart_id", cartRes.data.id);
      window.location.href = "/";
    },
    error: () => {
      this.notify.error("Không thể tạo giỏ hàng mới!");
    }
  });
}
}
