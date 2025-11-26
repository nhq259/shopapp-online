import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
}
