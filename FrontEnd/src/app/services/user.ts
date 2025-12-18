import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const api = "http://localhost:3000/api";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {}

  getUserById(id: number) {
    return this.http.get(`${api}/users/${id}`);
  }

  updateUser(id: number, body: any) {
    return this.http.put<any>(`${api}/users/${id}`, body);
  }
    // ===== ADMIN =====
  getAllUsers(search = '', page = 1, limit = 5) {
    let params = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('limit', limit);

    return this.http.get<any>(`${api}/admin/users`, { params });
  }

  toggleUserStatus(id: number) {
    return this.http.patch(`${api}/users/${id}/status`, {});
  }

  softDeleteUser(id: number) {
    return this.http.delete(`${api}/admin/users/${id}`);
  }
}
