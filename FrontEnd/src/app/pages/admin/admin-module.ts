import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ToastrModule } from 'ngx-toastr';

import { AdminRoutingModule } from './admin-routing-module';
import { AdminLayout } from './admin-layout/admin-layout';
import { Dashboard } from './dashboard/dashboard';
import { Orders } from './orders/orders';
import { Products } from './products/products';
import { ProductCreate } from './products/product-create/product-create';
import { FormsModule } from '@angular/forms';
import { ProductDetail } from './products/product-detail/product-detail';
import { ProductEdit } from './products/product-edit/product-edit';
import { ProductImage } from './products/product-image/product-image';
import { Categories } from './categories/categories';
import { Brands } from './brands/brands';
import { CategoryCreate } from './categories/category-create/category-create';
import { CategoryEdit } from './categories/category-edit/category-edit';
import { CategoryDetail } from './categories/category-detail/category-detail';
import { BrandDetail } from './brands/brand-detail/brand-detail';
import { BrandCreate } from './brands/brand-create/brand-create';
import { BrandEdit } from './brands/brand-edit/brand-edit';
import { Users } from './users/users';
import { UserDetail } from './users/user-detail/user-detail';
import { OrderDetail } from './orders/order-detail/order-detail';


@NgModule({
  declarations: [
    AdminLayout,
    Dashboard,
    Orders,
    Products,
    ProductCreate,
    ProductDetail,
    ProductEdit,
    ProductImage,
    Categories,
    Brands,
    CategoryCreate,
    CategoryEdit,
    CategoryDetail,
    BrandDetail,
    BrandCreate,
    BrandEdit,
    Users,
    UserDetail,
    OrderDetail,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminRoutingModule,
    ToastrModule,
  ]
})
export class AdminModule { }
