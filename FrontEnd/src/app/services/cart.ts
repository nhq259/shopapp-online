import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

const api = "http://localhost:3000/api";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  // ⭐ BehaviorSubject để đẩy số lượng cho header
  cartCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  updateCartCount(count: number) {
    this.cartCount.next(count);
  }

  /** Lấy cart theo ID */
  getCartById(cart_id: number) {
    return this.http.get<any>(`${api}/carts/${cart_id}`);
  }

  /** Lấy hoặc tạo cart cho user */
  createOrGetCart(user_id: number) {
    return this.http.post<any>(`${api}/carts`, {
      user_id,
      // session_id: null
    });
  }

  /** Thêm hoặc update cart item */
  updateCartItem(cart_id: number, product_id: number, quantity: number) {
    return this.http.post<any>(`${api}/cart-items`, {
      cart_id,
      product_id,
      quantity
    });
  }

  /** Xóa cart item */
  deleteItem(id: number) {
    return this.http.delete(`${api}/cart-items/${id}`);
  }

  /** Checkout */
  checkout(body: any) {
    return this.http.post<any>(`${api}/carts/checkout`, body);
  }
}
