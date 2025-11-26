import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  products: any;

    constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((res:any)=>{
      this.products = res.data
      console.log('Products:', this.products);
    })
  }
  
}
