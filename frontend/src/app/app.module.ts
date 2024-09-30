import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';  // Import the AppComponent
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent  // Declare the AppComponent here
  ],
  imports: [
    BrowserModule,
    HttpClientModule  // Import HttpClientModule to handle API requests
  ],
  providers: [],
  bootstrap: [AppComponent]  // Bootstrap with AppComponent
})
export class AppModule { }
