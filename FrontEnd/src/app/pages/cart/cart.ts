import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-cart',
  standalone:false,
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart implements OnInit {

  cart_id: number = 0;
  items: any[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const user_id = user.id;

  if (!user_id) return;

    // Tạo hoặc lấy cart user
    this.cartService.createOrGetCart(user_id).subscribe(res => {
      this.cart_id = res.data.id;
      localStorage.setItem("cart_id", this.cart_id.toString());
      this.loadCart();
    });
  }

  loadCart() {
    this.cartService.getCartById(this.cart_id).subscribe(res => {
      this.items = res.data.CartItems || [];

      // ⭐ cập nhật số lượng trong mini cart
    const totalQty = this.items.reduce((s, i) => s + i.quantity, 0);
    this.cartService.updateCartCount(totalQty);
    });
  }

  formatVND(value: number) {
    return value.toLocaleString("vi-VN") + " ₫";
  }

  // Tăng giảm số lượng
  changeQty(item: any, type: 'plus' | 'minus') {
    let newQty = item.quantity + (type === 'plus' ? 1 : -1);
    if (newQty < 1) newQty = 1;

    this.cartService.updateCartItem(this.cart_id, item.product_id, newQty)
      .subscribe(() => this.loadCart());
  }

  // Xóa SP
  remove(item: any) {
    this.cartService.updateCartItem(this.cart_id, item.product_id, 0)
      .subscribe(() => this.loadCart());
  }

  getTotal() {
    return this.items.reduce((s, i) => s + i.quantity * i.Product.price, 0);
  }

  goCheckout() {
    window.location.href = "/checkout";
  }
}
