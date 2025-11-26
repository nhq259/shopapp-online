import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Home } from './pages/home/home';
import { Shop } from './pages/shop/shop';
import { Login } from './components/login/login';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Register } from './components/register/register';
import { ProductDetail } from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { Profile } from './pages/profile/profile';
import { EditProfile } from './pages/profile/edit-profile/edit-profile';

@NgModule({
  declarations: [
    App,
    Header,
    Footer,
    Home,
    Shop,
    Login,
    Register,
    ProductDetail,
    Cart,
    Checkout,
    Profile,
    EditProfile,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
  ],
  bootstrap: [App]
})
export class AppModule { }
