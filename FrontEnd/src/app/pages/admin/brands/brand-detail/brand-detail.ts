import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BrandService } from '../../../../services/brand';

@Component({
  selector: 'app-brand-detail',
  standalone: false,
  templateUrl: './brand-detail.html',
  styleUrl: './brand-detail.css',
})
export class BrandDetail implements OnInit {

  brand: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private brandService: BrandService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.brandService.getBrandById(id).subscribe(res => {
      this.brand = res.data;
    });
  }

  edit() {
    this.router.navigate(['/admin/brands/edit', this.brand.id]);
  }

   formatDate(date: string) {
    return new Date(date).toLocaleString('vi-VN');
  }
}
