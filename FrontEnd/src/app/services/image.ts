import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const api = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root',
})
export class ImageService {

  constructor(private http: HttpClient) {}

  /**
   * Upload 1 ảnh lên server
   * @param file File ảnh chọn từ máy
   */
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('images', file); // 👈 key phải là "images" (đúng với BE)

    return this.http.post<any>(
      `${api}/images/upload`,
      formData
    );
  }

  /**
   * Upload nhiều ảnh (nếu cần dùng sau này)
   */
  uploadImages(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.http.post<any>(
      `${api}/images/upload`,
      formData
    );
  }

  /**
   * Xóa ảnh
   */
  deleteImage(fileName: string): Observable<any> {
    return this.http.delete<any>(
      `${api}/images`,
      {
        body: { image: fileName }
      }
    );
  }

  /**
   * Helper: trả về URL hiển thị ảnh
   */
  getImageUrl(fileName: string): string {
    return `http://localhost:3000/uploads/${fileName}`;
  }
}
