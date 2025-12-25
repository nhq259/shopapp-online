import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../services/product';
import { CategoryService } from '../../../../services/category';
import { BrandService } from '../../../../services/brand';
import { ImageService } from '../../../../services/image';
import { NotificationService } from '../../../../services/notifycation';

@Component({
  selector: 'app-product-edit',
  standalone: false,
  templateUrl: './product-edit.html',
  styleUrl: './product-edit.css',
})
export class ProductEdit implements OnInit {
 
  productId!: number;

   selectedFile: File | null = null;
previewImage: string | null = null;

  product: any = {
    name: '',
    price: 0,
    oldprice: 0,
    quantity: 0,
    buyturn: 0,
    category_id: '',
    brand_id: '',
    status: 'active',
    description: '',
    specification: '',
    attributes: []
  };

  categories: any[] = [];
  brands: any[] = [];

  loading = true;
    submitting = false;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
     private imageService: ImageService,
     private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadProduct();
    this.loadCategories();
    this.loadBrands();
  }

  /** Load product detail */
  loadProduct() {
    this.productService.getProductById(this.productId).subscribe({
      next: (res) => {
        const p = res.data;

        this.product = {
          name: p.name,
          price: p.price,
          oldprice: p.oldprice,
          quantity: p.quantity,
          buyturn: p.buyturn,
          category_id: p.category_id,
          brand_id: p.brand_id,
          status: p.status,
          description: p.description,
          specification: p.specification,
          attributes: p.attributes || []
        };
// 👇 preview ảnh hiện tại
        this.previewImage = p.image || null;
        this.loading = false;
      },
      error: () => {
        this.notify.error('Không thể tải sản phẩm');
        this.router.navigate(['/admin/products']);
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(res => {
      this.categories = res.data;
    });
  }

  loadBrands() {
    this.brandService.getBrands().subscribe(res => {
      this.brands = res.data;
    });
  }
   // =========================
  // IMAGE HANDLING
  // =========================

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    // Preview ảnh mới
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  /** Attributes */
  addAttribute() {
    this.product.attributes.push({ name: '', value: '' });
  }

  removeAttribute(index: number) {
    this.product.attributes.splice(index, 1);
  }

  /** Submit update */
   submit() {
    if (!this.product.name.trim()) {
       this.notify.warning('Tên sản phẩm là bắt buộc');
      return;
    }

    if (this.submitting) return;
    this.submitting = true;

    const updateProduct = (imageFileName?: string) => {
      const payload = {
        ...this.product,
        image: imageFileName || this.product.image
      };

      this.productService.updateProduct(this.productId, payload).subscribe({
        next: () => {
          this.notify.success('Cập nhật sản phẩm thành công');
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.notify.error(err.error?.message || 'Cập nhật thất bại');
          this.submitting = false;
        }
      });
    };

    // 👉 Nếu có chọn ảnh mới → upload trước
    if (this.selectedFile) {
      this.imageService.uploadImage(this.selectedFile).subscribe({
        next: (res) => {
          const fileName = res.files[0];
          updateProduct(fileName);
        },
        error: () => {
          this.notify.error('Upload ảnh thất bại');
          this.submitting = false;
        }
      });
    } else {
      // 👉 Không đổi ảnh
      updateProduct();
    }
  }
}
