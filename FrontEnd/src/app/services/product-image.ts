import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const api = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class ProductImageService {

  constructor(private http: HttpClient) {}

  getProductImages(productId?: number, page = 1): Observable<any> {
  const params: any = { page };

  if (productId !== undefined && productId !== null) {
    params.product_id = productId;
  }

  return this.http.get<any>(`${api}/product-images`, { params });
}


  searchProducts(keyword: string) {
  return this.http.get<any>(`${api}/admin/products/search`, {
    params: { keyword }
  });
}

    createProductImage(data: any) {
    return this.http.post<any>(`${api}/product-images`, data);
  }

  deleteProductImage(id: number) {
    return this.http.delete<any>(`${api}/product-images/${id}`);
  }
}
