import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../services/category';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  standalone: false,
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {

  categories: any[] = [];
  page = 1;
  totalPages = 1;
  search = '';

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(page = 1) {
    this.categoryService.getCategories(page, this.search).subscribe(res => {
      this.categories = res.data;
      this.page = res.currentPage;
      this.totalPages = res.totalPages;
    });
  }

  onSearch() {
    this.loadCategories(1);
  }
  view(id: number) {
  this.router.navigate(['/admin/categories/detail', id]);
}

  create() {
    this.router.navigate(['/admin/categories/create']);
  }

  edit(id: number) {
    this.router.navigate(['/admin/categories/edit', id]);
  }

  delete(id: number) {
    if (!confirm('Xóa danh mục này?')) return;

    this.categoryService.deleteCategory(id).subscribe(() => {
      alert('Đã xóa danh mục');
      this.loadCategories(this.page);
    });
  }
}
