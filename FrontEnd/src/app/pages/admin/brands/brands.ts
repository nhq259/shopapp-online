import { Component, OnInit } from '@angular/core';
import { BrandService } from '../../../services/brand';
import { Router } from '@angular/router';

@Component({
  selector: 'app-brands',
  standalone: false,
  templateUrl: './brands.html',
  styleUrl: './brands.css',
})
export class Brands implements OnInit {

  brands: any[] = [];
  page = 1;
  totalPages = 1;
  search = '';

  constructor(
    private brandService: BrandService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBrands(1);
  }

  loadBrands(page: number) {
    this.brandService.getBrands(page, this.search).subscribe(res => {
      this.brands = res.data;
      this.page = res.currentPage;
      this.totalPages = res.totalPages;
    });
  }

  onSearch() {
    this.loadBrands(1);
  }

  create() {
    this.router.navigate(['/admin/brands/create']);
  }

  view(id: number) {
    this.router.navigate(['/admin/brands/detail', id]);
  }

  edit(id: number) {
    this.router.navigate(['/admin/brands', 'edit', id]);
  }

  delete(id: number) {
    if (!confirm('Xóa thương hiệu này?')) return;

    this.brandService.deleteBrand(id).subscribe(() => {
      alert('Đã xóa thương hiệu');
      this.loadBrands(this.page);
    });
  }
}
