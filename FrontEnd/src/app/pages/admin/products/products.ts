import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product';
import { BrandService } from '../../../services/brand';
import { CategoryService } from '../../../services/category';

import { NotificationService } from '../../../services/notifycation';

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class Products {
products: any[] = [];
  currentPage = 1;
  totalPages = 1;

  pageSize = 10;

  filters: any = {
  search: '',
  category: '',
  brand: '',
  price_min: '',
  price_max: ''
};

categories: any[] = [];
brands: any[] = [];


  constructor(
    private productService: ProductService,
    private router: Router,
    private categoryService: CategoryService,
    private brandService: BrandService,
         private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts(1);
      this.loadCategories();
  this.loadBrands();
  }

  /** ⭐ Load product list có phân trang */
  loadProducts(page: number) {
    this.productService.getProductsAdmin(page, this.pageSize,this.filters).subscribe({
      next: (res: any) => {
        this.products = res.data;
        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
      },
      error: (err) => {
        console.error("LOAD PRODUCTS ERROR:", err);
         this.notify.error("Không thể tải danh sách sản phẩm");
      }
    });
  }
  loadCategories() {
  this.categoryService.getCategories(1, '').subscribe(res => {
    this.categories = res.data;
  });
}

loadBrands() {
  this.brandService.getBrands(1, '').subscribe(res => {
    this.brands = res.data;
  });
}

applyFilter() {
  this.loadProducts(1);
}

resetFilter() {
  this.filters = {
    search: '',
    category: '',
    brand: '',
    price_min: '',
    price_max: ''
  };
  this.loadProducts(1);
}



  /** ⭐ Chuyển sang trang edit */
  editProduct(id: number) {
    this.router.navigate(['/admin/products/edit', id]);
  }

  /** ⭐ Chuyển sang trang chi tiết */
  viewDetail(id: number) {
    this.router.navigate(['/admin/products/detail', id]);
  }

  /** ⭐ Sang trang thêm mới */
  createProduct() {
    this.router.navigate(['/admin/products/create']);
  }

  // change status product
  toggleStatus(product: any) {
  const confirmMsg =
    product.status === 'active'
      ? 'Bạn muốn NGỪNG BÁN sản phẩm này?'
      : 'Bạn muốn KÍCH HOẠT lại sản phẩm này?';

  if (!confirm(confirmMsg)) {
    this.notify.info('Đã hủy thao tác');
    return;
  }

   this.productService.toggleProductStatus(product.id).subscribe({
    next: (res) => {
      product.status = res.data.status;

      const msg =
        product.status === 'active'
          ? 'Sản phẩm đã được kích hoạt'
          : 'Sản phẩm đã được ngừng bán';

      this.notify.success(msg, 'Thành công');
    },
    error: () => {
      this.notify.error('Không thể cập nhật trạng thái sản phẩm', 'Lỗi');
    }
  });
}

//xóa mềm sp
deleteProduct(id: number) {
  const ok = confirm(
    'Bạn có chắc chắn muốn XÓA sản phẩm này?\n' +
    'Sản phẩm sẽ bị ẩn khỏi hệ thống.'
  );

  if (!ok) {
    this.notify.info('Đã hủy xóa sản phẩm');
    return;
  }

  this.productService.deleteProduct(id).subscribe({
    next: (res) => {
      this.notify.success(
        res.message || 'Xóa sản phẩm thành công',
        'Thành công'
      );

      // reload lại danh sách trang hiện tại
      this.loadProducts(this.currentPage);
    },
    error: (err) => {
      this.notify.error(
        err.error?.message ||
        'Không thể xóa sản phẩm. Vui lòng thử lại.',
        'Lỗi'
      );
    }
  });
}



}
