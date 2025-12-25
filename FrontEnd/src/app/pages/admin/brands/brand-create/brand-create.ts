import { Component } from '@angular/core';
import { BrandService } from '../../../../services/brand';
import { ImageService } from '../../../../services/image';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../services/notifycation';

@Component({
  selector: 'app-brand-create',
  standalone: false,
  templateUrl: './brand-create.html',
  styleUrl: './brand-create.css',
})
export class BrandCreate {

  brand: any = {
    name: '',
    image: ''
  };

  selectedFile: File | null = null;
  previewImage: string | null = null;

  constructor(
    private brandService: BrandService,
    private imageService: ImageService,
    private router: Router,
    private notify: NotificationService
  ) {}

  /** chọn file ảnh */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    // preview ảnh
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  /** submit form */
  submit() {
    if (!this.brand.name.trim()) {
      this.notify.warning('Tên thương hiệu là bắt buộc');
      return;
    }

    // nếu có upload ảnh
    if (this.selectedFile) {
      this.imageService.uploadImage(this.selectedFile).subscribe({
        next: (res) => {
          this.brand.image = res.files[0];
          this.createBrand();
        },
        error: () => this.notify.error('Upload ảnh thất bại')
      });
    } else {
      this.createBrand();
    }
  }

  private createBrand() {
    this.brandService.createBrand(this.brand).subscribe({
      next: () => {
        this.notify.success('Thêm thương hiệu thành công');
        this.router.navigate(['/admin/brands']);
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Không thể thêm thương hiệu');
      }
    });
  }
}
