import { Component, OnInit } from '@angular/core';
import { ProductImageService } from '../../../../services/product-image';
import { ProductService } from '../../../../services/product';
import { ImageService } from '../../../../services/image';
  import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-product-image',
  standalone: false,
  templateUrl: './product-image.html',
  styleUrl: './product-image.css',
})
export class ProductImage implements OnInit {

  productImages: any[] = [];
  products: any[] = [];

  selectedFile: File | null = null;
  selectedProductId!: number; 
  searchTerm = '';
selectedProduct: any = null;


  page = 1;
  totalPages = 1;

@ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;


  constructor(
    private productImageService: ProductImageService,
    private productService: ProductService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    // this.loadProducts();
    this.loadImages(1);
  }

  loadProducts() {
    this.productService.getProductsAdmin(1, 100).subscribe(res => {
      this.products = res.data;
    });
  }

  loadImages(page = 1) {
  const productId =
    this.selectedProductId && !isNaN(this.selectedProductId)
      ? this.selectedProductId
      : undefined;

  this.productImageService
    .getProductImages(productId as any, page)
    .subscribe(res => {
      this.productImages = res.data;
      this.page = res.currentPage;
      this.totalPages = res.totalPages;
    });
}

onSearchProduct() {
  if (this.searchTerm.trim().length < 2) {
    this.products = [];
    return;
  }

  this.productImageService.searchProducts(this.searchTerm).subscribe(res => {
    this.products = res.data;
  });
}

clearSelectedProduct() {
  this.selectedProduct = null;
  this.selectedProductId = undefined as any;
  this.searchTerm = '';
  this.products = [];
  this.loadImages(1);
}


selectProduct(product: any) {
  this.selectedProduct = product;
  this.selectedProductId = product.id;
  this.products = [];
  this.loadImages(1);
}
  onProductChange() {
    this.loadImages(1);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  addImage() {
    if (!this.selectedProductId || !this.selectedFile) {
      alert('Chọn sản phẩm và ảnh');
      return;
    }

    this.imageService.uploadImage(this.selectedFile).subscribe(res => {
      const fileName = res.files[0];

      this.productImageService.createProductImage({
        product_id: this.selectedProductId,
        image_url: fileName
      }).subscribe(() => {
        alert('Thêm ảnh thành công');
        // ✅ RESET ĐÚNG
        this.selectedFile = null;
        this.fileInput.nativeElement.value = '';
        this.loadImages();
      });
    });
  }

  deleteImage(id: number) {
    if (!confirm('Xóa ảnh này?')) return;

    this.productImageService.deleteProductImage(id).subscribe(() => {
      alert('Đã xóa ảnh');
      this.loadImages(this.page);
    });
  }
}
