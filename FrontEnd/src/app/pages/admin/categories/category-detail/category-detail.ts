import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../../services/category';

@Component({
  selector: 'app-category-detail',
  standalone: false,
  templateUrl: './category-detail.html',
  styleUrl: './category-detail.css',
})
export class CategoryDetail implements OnInit {

  category: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCategory(id);
  }

  loadCategory(id: number) {
    this.categoryService.getCategoryById(id).subscribe({
      next: (res) => {
        this.category = res.data;
        this.loading = false;
      },
      error: () => {
        alert('Không tìm thấy danh mục');
        this.router.navigate(['/admin/categories']);
      }
    });
  }

  edit() {
    this.router.navigate(['/admin/categories/edit', this.category.id]);
  }

  back() {
    this.router.navigate(['/admin/categories']);
  }
}
