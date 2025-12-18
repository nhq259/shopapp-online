import { Component } from '@angular/core';
import { ProductService } from '../../../../services/product';
import { Router } from '@angular/router';
import { CategoryService } from '../../../../services/category';
import { BrandService } from '../../../../services/brand'; 
import { ImageService } from '../../../../services/image';


@Component({
  selector: 'app-product-create',
  standalone: false,
  templateUrl: './product-create.html',
  styleUrl: './product-create.css',
})
export class ProductCreate {

   categories: any[] = [];
  brands: any[] = [];

  product = {
    name: '',
    price: 0,
    oldprice:0,
    quantity: 0,
    category_id: '',
    brand_id: '',
    image: '',
    description: '',
    specification: '',
    attributes: [
      { name: '', value: '' }
    ]
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private imageService: ImageService,


    private router: Router
  ) {}

  selectedFile: File | null = null;
previewImage: string | null = null;

onFileSelected(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  this.selectedFile = file;

  // Preview ảnh
  const reader = new FileReader();
  reader.onload = () => {
    this.previewImage = reader.result as string;
  };
  reader.readAsDataURL(file);
}

   ngOnInit() {
    this.loadCategories();
    this.loadBrands();
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

  /** ➕ Thêm dòng attribute */
  addAttribute() {
    this.product.attributes.push({ name: '', value: '' });
  }

  /** ❌ Xóa dòng attribute */
  removeAttribute(index: number) {
    this.product.attributes.splice(index, 1);
  }

  /** 💾 Submit form */
  submit() {
  if (!this.product.name.trim()) {
    alert("Tên sản phẩm là bắt buộc");
    return;
  }

  if (!this.selectedFile) {
    alert("Vui lòng chọn ảnh");
    return;
  }

  // 1️⃣ Upload ảnh trước
  this.imageService.uploadImage(this.selectedFile).subscribe({
    next: (res) => {
      const fileName = res.files[0]; // ví dụ: abc.jpg

      // 2️⃣ Gán ảnh vào product
      const payload = {
        ...this.product,
        image: fileName
      };

      // 3️⃣ Tạo product
      this.productService.createProduct(payload).subscribe({
        next: () => {
          alert("Thêm sản phẩm thành công");
          this.router.navigate(["/admin/products"]);
        },
        error: err => {
          alert(err.error?.message || "Lỗi tạo sản phẩm");
        }
      });
    },
    error: () => {
      alert("Upload ảnh thất bại");
    }
  });
}

}
