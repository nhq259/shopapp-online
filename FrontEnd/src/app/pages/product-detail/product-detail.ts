import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetail implements OnInit {

  product: any = null;
  quantity: number = 1; // mặc định 1 sản phẩm

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
      private cartService: CartService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    this.loadProduct(Number(id));
  }

  loadProduct(id: number) {
    this.productService.getProductById(id).subscribe((res: any) => {
      this.product = res.data;
      this.quantity = 1; // reset khi load sản phẩm mới
    });
  }

  /** Tăng số lượng */
  increaseQty() {
    if (this.quantity < this.product.quantity) {
      this.quantity++;
    }
  }

  /** Giảm số lượng */
  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  /** Kiểm tra khi nhập tay */
  validateQty() {
    if (this.quantity < 1) this.quantity = 1;
    if (this.quantity > this.product.quantity) {
      this.quantity = this.product.quantity;
    }
  }

   /** ⭐ Add to Cart chính thức gọi API backend */
  addToCart() {
    const cart_id = Number(localStorage.getItem("cart_id"));

    if (!cart_id) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    if (this.quantity > this.product.quantity) {
      alert(`Không đủ tồn kho! Chỉ còn ${this.product.quantity} sản phẩm`);
      return;
    }

    this.cartService.updateCartItem(
      cart_id,
      this.product.id,
      this.quantity
    )
    .subscribe({
      next: (res: any) => {
        // ⭐ Load lại giỏ để update mini cart
      this.cartService.getCartById(cart_id).subscribe(cartRes => {
        const totalQty = cartRes.data.CartItems
          .reduce((s: number, i: any) => s + i.quantity, 0);

        this.cartService.updateCartCount(totalQty);
      });
        
        alert("Đã thêm sản phẩm vào giỏ hàng!");
      },
      error: (err) => {
        alert(err.error?.message || "Không thể thêm sản phẩm vào giỏ");
      }
    });
  }

  /** Format tiền Việt Nam */
  formatVND(value: number) {
    return value?.toLocaleString("vi-VN") + " ₫";
  }

}
