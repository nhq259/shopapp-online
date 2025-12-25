import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const api = "http://localhost:3000/api";

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) {}

  getOrdersByUser(userId: number) {
    return this.http.get<any>(`${api}/orders/user/${userId}`);
  }
  // ===== ADMIN =====
  getOrders(
  search = '',
  page = 1,
  status?: number
) {
  let params = new HttpParams()
    .set('search', search)
    .set('page', page);

  if (status !== undefined) {
    params = params.set('status', status.toString());
  }

  return this.http.get<any>(`${api}/orders`, { params });
}


  getOrderById(orderId: number) {
    return this.http.get<any>(`${api}/orders/${orderId}`);
  }

  updateOrder(orderId: number, body: any) {
    return this.http.put<any>(`${api}/orders/${orderId}`, body);
  }

  softDeleteOrder(orderId: number) {
    return this.http.delete<any>(`${api}/orders/${orderId}`);
  }

  updateOrderStatus(orderId: number, body: { status: number }) {
  return this.http.patch<any>(`${api}/orders/${orderId}/status`, body);
}

cancelOrder(orderId: number) {
  return this.http.patch<any>(`${api}/orders/${orderId}/cancel`, {});
}

}
