import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const api = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  /** 
   * Gọi API lấy danh sách sản phẩm có filter 
   * FE gửi: /products?page=1&pageSize=6&search=&category=4&brand=8&price_min=0&price_max=5000000
   */
  getProducts(
    page: number = 1,
    pageSize: number = 6,
    filters: any = {}
  ) {
    return this.http.get<any>(`${api}/products`, {
      params: {
        page,
        pageSize,
        search: filters.search || "",
        category: filters.category || "",
        brand: filters.brand || "",
        price_min: filters.price_min || "",
        price_max: filters.price_max || ""
      }
    });
  }

  getProductById(id: number) {
  return this.http.get<any>(`${api}/products/${id}`);
}

}
