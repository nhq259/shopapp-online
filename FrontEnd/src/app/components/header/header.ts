import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  cartCount: number = 0;
  isLogin: any;
  userName = '';
  userAvatar = '';
  orderCount = 0;
  userId = 0;
  isAdmin = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private cartService: CartService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    // Lấy số lượng khi mở trang
    const cart_id = Number(localStorage.getItem('cart_id'));
    if (cart_id) {
      this.cartService.getCartById(cart_id).subscribe((res) => {
        const count = res.data.CartItems.reduce(
          (total: number, item: any) => total + item.quantity,
          0
        );
        this.cartService.updateCartCount(count);
      });
    }

    // Lắng nghe thay đổi mini cart
    this.cartService.cartCount.subscribe((count) => {
      this.cartCount = count;
    });

    this.isLogin = this.loginService.checkLogin();
    if (this.isLogin) {
      const user = this.loginService.getUser();
       this.userId = user.id;
      this.userName = user.name;
      this.userAvatar = user.avatar;
      this.isAdmin = user.role === 2;
      // ⭐ Load số đơn hàng người dùng đã đặt
      this.loadOrderCount(this.userId);
    }
  }

  /* -----------------------
     ⭐ Lấy số đơn hàng của user
     ----------------------- */
  loadOrderCount(userId: number) {
    this.orderService.getOrdersByUser(userId).subscribe({
      next: (res: any) => {
        this.orderCount = res.data.length;
      },
      error: () => {
        this.orderCount = 0;
      }
    });
  }

  onLogout() {
    localStorage.clear();
    location.reload();
  }

  goToCart() {
    const cart_id = localStorage.getItem('cart_id');

    if (!cart_id) {
      alert('Bạn chưa có giỏ hàng — hãy đăng nhập!');
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/carts', cart_id]); // → /cart/12
  }

  goToCheckout() {
    const cart_id = localStorage.getItem('cart_id');

    if (!cart_id) {
      alert('Bạn chưa có giỏ hàng — hãy đăng nhập!');
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/checkout']); // checkout không cần id
  }
}
