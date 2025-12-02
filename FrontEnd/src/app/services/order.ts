import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const api = "http://localhost:3000/api";

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) {}

  getOrdersByUser(userId: number) {
    return this.http.get<any>(`${api}/orders/user/${userId}`);
  }
  getOrderById(orderId: number) {
    return this.http.get<any>(`${api}/orders/${orderId}`);
  }
}
