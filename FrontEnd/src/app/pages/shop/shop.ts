import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product';
import { CategoryService } from '../../services/category';
import { BrandService } from '../../services/brand';
import { CartService } from '../../services/cart';
import { NotificationService } from '../../services/notifycation';

@Component({
  selector: 'app-shop',
  standalone: false,
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];

  categories: any[] = [];
  brands: any[] = [];

  // FILTER CONDITIONS
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedBrand: string = '';
  selectedPrice: string = '';

  // PAGINATION
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private cartService: CartService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.loadProducts(1);
  }

  /** Load categories */
  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.data || [];
      },
      error: (err) => console.log('Category API error', err),
    });
  }

  /** Load brands */
  loadBrands() {
    this.brandService.getBrands().subscribe({
      next: (res: any) => {
        this.brands = res.data || [];
      },
      error: (err) => console.log('Brand API error', err),
    });
  }

  /** Convert selected price range into min-max */
  buildPriceRange() {
    if (!this.selectedPrice) return {};
    const [min, max] = this.selectedPrice.split('-');
    return {
      price_min: min,
      price_max: max,
    };
  }

  /** Load product */
  loadProducts(page: number) {
    const filters = {
      search: this.searchTerm,
      category: this.selectedCategory,
      brand: this.selectedBrand,
      ...this.buildPriceRange(),
    };

    this.productService.getProducts(page, 6, filters).subscribe({
      next: (res: any) => {
        this.products = res.data;
        this.filteredProducts = this.products;
        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
      },
      error: (err) => {
        console.log('Product API error:', err);
      },
    });
  }

  /** Search keyword */
  onSearch() {
    this.loadProducts(1);
  }

  /** Filter change */
  onFilterChange() {
    this.loadProducts(1);
  }

  /** Pagination */
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadProducts(page);
  }

  /** Format VND */
  formatVND(value: number) {
    return value.toLocaleString('vi-VN') + ' ₫';
  }

  // ⭐ Add to Cart
  addToCart(product: any) {
    const cart_id = Number(localStorage.getItem('cart_id'));

    if (!cart_id) {
      this.notify.info('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!');
      return;
    }

    const body = {
      cart_id: cart_id,
      product_id: product.id,
      quantity: 1,
    };

    this.cartService.updateCartItem(cart_id, product.id, 1).subscribe({
      next: (res) => {
        // 🔥 Gọi lại API giỏ hàng để cập nhật số lượng mini cart
        this.cartService.getCartById(cart_id).subscribe((cartRes) => {
          const totalQty = cartRes.data.CartItems.reduce(
            (s: number, i: any) => s + i.quantity,
            0
          );
          this.cartService.updateCartCount(totalQty);
        });
        this.notify.success('Đã thêm sản phẩm vào giỏ hàng!');
      },
      error: (err) => {
        this.notify.error(err.error.message || 'Không thể thêm sản phẩm');
      },
    });
  }
}
