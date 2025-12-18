import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const api = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  getCategories(page = 1, search = '') {
    return this.http.get<any>(`${api}/categories`, {
      params: { page, search }
    });
  }
  getCategoryById(id: number) {
    return this.http.get<any>(`${api}/categories/${id}`);
  }

  createCategory(data: any) {
    return this.http.post<any>(`${api}/categories`, data);
  }

  updateCategory(id: number, data: any) {
    return this.http.put<any>(`${api}/categories/${id}`, data);
  }

  deleteCategory(id: number) {
    return this.http.delete<any>(`${api}/categories/${id}`);
  }
}
