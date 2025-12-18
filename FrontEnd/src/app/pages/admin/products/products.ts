import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product';
import { BrandService } from '../../../services/brand';
import { CategoryService } from '../../../services/category';

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
    private brandService: BrandService
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
        alert("Không thể tải danh sách sản phẩm");
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

  if (!confirm(confirmMsg)) return;

  this.productService.toggleProductStatus(product.id).subscribe({
    next: (res) => {
      // update UI ngay, không cần reload
      product.status = res.data.status;
    },
    error: () => {
      alert('Không thể cập nhật trạng thái sản phẩm');
    }
  });
}

//xóa mềm sp
/** ⭐ XÓA MỀM SẢN PHẨM */
deleteProduct(id: number) {
  const ok = confirm(
    'Bạn có chắc chắn muốn XÓA sản phẩm này?\n' +
    'Sản phẩm sẽ bị ẩn khỏi hệ thống.'
  );

  if (!ok) return;

  this.productService.deleteProduct(id).subscribe({
    next: (res) => {
      alert(res.message || 'Xóa sản phẩm thành công');

      // reload lại danh sách trang hiện tại
      this.loadProducts(this.currentPage);
    },
    error: (err) => {
      alert(
        err.error?.message ||
        'Không thể xóa sản phẩm. Vui lòng thử lại.'
      );
    }
  });
}


}
