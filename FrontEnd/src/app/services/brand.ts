import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const api = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  constructor(private http: HttpClient) {}

  // getBrands() {
  //   return this.http.get<any>(`${api}/brands`);
  // }

  getBrands(page = 1, search = '') {
    return this.http.get<any>(`${api}/brands`, {
      params: { page, search }
    });
  }
  getBrandById(id: number) {
    return this.http.get<any>(`${api}/brands/${id}`);
  }

  createBrand(data: any) {
    return this.http.post<any>(`${api}/brands`, data);
  }

  updateBrand(id: number, data: any) {
    return this.http.put<any>(`${api}/brands/${id}`, data);
  }

  deleteBrand(id: number) {
    return this.http.delete<any>(`${api}/brands/${id}`);
  }
}
