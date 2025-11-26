import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';

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

  constructor(
    private loginService: LoginService,
    private router: Router,
    private cartService: CartService
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
      this.userName = user.name;
      this.userAvatar = user.avatar;
    }
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
