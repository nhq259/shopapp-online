import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const api = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  constructor(private http: HttpClient) {}

  getBrands() {
    return this.http.get<any>(`${api}/brands`);
  }
}
