import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayout } from './admin-layout/admin-layout';
import { Dashboard } from './dashboard/dashboard';
import { Orders } from './orders/orders';
import { Products } from './products/products';
import { ProductCreate } from './products/product-create/product-create';
import { ProductDetail } from './products/product-detail/product-detail';
import { ProductEdit } from './products/product-edit/product-edit';
import { ProductImage } from './products/product-image/product-image';
import { Categories } from './categories/categories';
import { Brands } from './brands/brands';
import { CategoryCreate } from './categories/category-create/category-create';
import { CategoryEdit } from './categories/category-edit/category-edit';
import { CategoryDetail } from './categories/category-detail/category-detail';
import { BrandDetail } from './brands/brand-detail/brand-detail';
import { BrandEdit } from './brands/brand-edit/brand-edit';
import { BrandCreate } from './brands/brand-create/brand-create';
import { Users } from './users/users';
import { UserDetail } from './users/user-detail/user-detail';

const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'product-images', component: ProductImage },
      {
        path: 'products',
        children: [
          { path: '', component: Products }, // /admin/products
          { path: 'create', component: ProductCreate },
          { path: 'detail/:id', component: ProductDetail },
          { path: 'edit/:id', component: ProductEdit },
        ],
      },
      { path: 'orders', component: Orders },
      {
        path: 'categories',
        children: [
          { path: '', component: Categories },
          { path: 'create', component: CategoryCreate },
          { path: 'edit/:id', component: CategoryEdit },
          { path: 'detail/:id', component: CategoryDetail },
        ],
      },
      {
        path: 'brands',
        children: [
          { path: '', component: Brands }, // list
          { path: 'create', component: BrandCreate },
          { path: 'detail/:id', component: BrandDetail }, // detail
          { path: 'edit/:id', component: BrandEdit },
        ],
      },
      {
        path: 'users',
        children: [
          { path: '', component: Users },
          { path: 'detail/:id', component: UserDetail },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
