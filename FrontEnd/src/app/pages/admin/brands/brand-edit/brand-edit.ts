import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BrandService } from '../../../../services/brand';
import { ImageService } from '../../../../services/image';
import { NotificationService } from '../../../../services/notifycation';

@Component({
  selector: 'app-brand-edit',
  standalone: false,
  templateUrl: './brand-edit.html',
  styleUrl: './brand-edit.css',
})
export class BrandEdit implements OnInit {

  brandId!: number;

  brand: any = {
    name: '',
    image: ''
  };

  // ⭐ BẮT BUỘC CÓ
  selectedFile: File | null = null;
  previewImage: string | null = null;

  loading = true;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private brandService: BrandService,
    private imageService: ImageService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.brandId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBrand();
  }

  /** Load chi tiết thương hiệu */
  loadBrand() {
    this.brandService.getBrandById(this.brandId).subscribe({
      next: (res) => {
        this.brand = {
          name: res.data.name,
          image: res.data.image
        };
        this.loading = false;
      },
      error: () => {
        this.notify.error('Không tìm thấy thương hiệu');
        this.router.navigate(['/admin/brands']);
      }
    });
  }

  /** Chọn ảnh mới */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    // preview ảnh mới
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  /** Validate dữ liệu */
  validate(): boolean {
    if (!this.brand.name || !this.brand.name.trim()) {
      this.notify.warning('Tên thương hiệu không được để trống');
      return false;
    }
    return true;
  }

  /** Submit cập nhật */
  submit() {
    if (!this.validate()) return;

    this.submitting = true;

    // Nếu có đổi ảnh → upload ảnh trước
    if (this.selectedFile) {
      this.imageService.uploadImage(this.selectedFile).subscribe({
        next: (res) => {
          this.brand.image = res.files[0];
          this.updateBrand();
        },
        error: () => {
          this.submitting = false;
          this.notify.error('Upload ảnh thất bại');
        }
      });
    } else {
      this.updateBrand();
    }
  }

  /** Gọi API update */
  private updateBrand() {
    this.brandService.updateBrand(this.brandId, this.brand).subscribe({
      next: () => {
        this.notify.success('Cập nhật thương hiệu thành công');
        this.router.navigate(['/admin/brands']);
      },
      error: (err) => {
        this.submitting = false;
        this.notify.error(err.error?.message || 'Không thể cập nhật thương hiệu');
      }
    });
  }
}
