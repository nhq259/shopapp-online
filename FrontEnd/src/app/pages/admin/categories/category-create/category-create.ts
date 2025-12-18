import { Component } from '@angular/core';
import { CategoryService } from '../../../../services/category';
import { Router } from '@angular/router';
import { ImageService } from '../../../../services/image';

@Component({
  selector: 'app-category-create',
  standalone: false,
  templateUrl: './category-create.html',
  styleUrl: './category-create.css',
})
export class CategoryCreate {

  category: any = {
    name: '',
    image: ''
  };

  selectedFile: File | null = null;
  previewImage: string | null = null;
  uploading = false;

  constructor(
    private categoryService: CategoryService,
    private imageService: ImageService,
    private router: Router
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    // preview
    const reader = new FileReader();
    reader.onload = () => this.previewImage = reader.result as string;
    reader.readAsDataURL(file);
  }

  submit() {
    if (!this.category.name.trim()) {
      alert('Tên danh mục là bắt buộc');
      return;
    }

    // Nếu có chọn ảnh → upload trước
    if (this.selectedFile) {
      this.uploading = true;

      this.imageService.uploadImage(this.selectedFile).subscribe({
        next: (res) => {
          this.category.image = res.files[0]; // chỉ lưu filename
          this.createCategory();
        },
        error: () => {
          alert('Upload ảnh thất bại');
          this.uploading = false;
        }
      });
    } else {
      this.createCategory();
    }
  }

  private createCategory() {
    this.categoryService.createCategory(this.category).subscribe({
      next: () => {
        alert('Thêm danh mục thành công');
        this.router.navigate(['/admin/categories']);
      },
      error: (err) => {
        alert(err.error?.message || 'Thêm danh mục thất bại');
        this.uploading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/categories']);
  }
}
