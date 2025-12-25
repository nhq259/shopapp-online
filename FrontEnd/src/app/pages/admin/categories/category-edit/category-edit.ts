import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../../services/category';
import { ImageService } from '../../../../services/image';
import { NotificationService } from '../../../../services/notifycation';

@Component({
  selector: 'app-category-edit',
  standalone: false,
  templateUrl: './category-edit.html',
  styleUrl: './category-edit.css',
})
export class CategoryEdit implements OnInit {

  categoryId!: number;
  category: any = {
    name: '',
    image: ''
  };

  selectedFile: File | null = null;
  previewImage: string | null = null;
  uploading = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private imageService: ImageService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCategory();
  }

  loadCategory() {
    this.categoryService.getCategoryById(this.categoryId).subscribe({
      next: (res) => {
        this.category = {
          name: res.data.name,
          image: res.data.image
        };
        this.previewImage = res.data.image; // ảnh hiện tại
        this.loading = false;
      },
      error: () => {
        this.notify.error('Không tìm thấy danh mục');
        this.router.navigate(['/admin/categories']);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => this.previewImage = reader.result as string;
    reader.readAsDataURL(file);
  }

  submit() {
    if (!this.category.name.trim()) {
      this.notify.warning('Tên danh mục là bắt buộc');
      return;
    }

    if (this.selectedFile) {
      this.uploading = true;

      this.imageService.uploadImage(this.selectedFile).subscribe({
        next: (res) => {
          this.category.image = res.files[0];
          this.updateCategory();
        },
        error: () => {
          this.notify.error('Upload ảnh thất bại');
          this.uploading = false;
        }
      });
    } else {
      this.updateCategory();
    }
  }

  private updateCategory() {
    this.categoryService.updateCategory(this.categoryId, this.category).subscribe({
      next: () => {
        this.notify.success('Cập nhật danh mục thành công');
        this.router.navigate(['/admin/categories']);
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Cập nhật thất bại');
        this.uploading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/categories']);
  }
}
