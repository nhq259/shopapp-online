import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../services/product';
import { ProductImageService } from '../../../../services/product-image';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {

  product: any = null;
  loading = true;
  error = '';
  selectedImage = '';
   productImages: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private productImageService: ProductImageService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct(id);
  }

  loadProduct(id: number) {
    this.loading = true;

    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res.data;

        // ảnh đại diện
        this.selectedImage =
          this.product.image ||
          (this.product.product_images?.[0]?.image_url ?? '');

        this.loading = false;

         this.loadProductImages();
      },
      error: (err) => {
        this.error = err.error?.message || 'Không thể tải sản phẩm';
        this.loading = false;
      }
    });
  }

   loadProductImages() {
    this.productImageService
      .getProductImages(this.product.id)
      .subscribe(res => {
        this.productImages = res.data || [];

        // nếu chưa có selectedImage → lấy ảnh đầu tiên
        if (!this.selectedImage && this.productImages.length > 0) {
          this.selectedImage = this.productImages[0].image_url;
        }
      });
  }

  selectImage(img: string) {
    this.selectedImage = img;
  }

  /** 👉 Chuyển sang trang chỉnh sửa */
  editProduct() {
    this.router.navigate(['/admin/products/edit', this.product.id]);
  }
}
