import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private storageKey = 'wishlist';

  private wishListSubject = new Subject<any[]>();

  constructor() { }

  addToWishlist(hotel: any) {
    const currentWishlist = this.getWishlistFromStorage();
    
  
    //
    if(currentWishlist.length==0){
      currentWishlist.push(hotel);
      this.saveWishlistToStorage(currentWishlist);
      //
      this.wishListSubject.next(currentWishlist);
      //
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: 'success',
        timerProgressBar: false,
        timer: 3000,
        title: 'Added successfully'
      })
    }else{
      // Check if the new object already exists based on some property (e.g., id)
      const exists = currentWishlist.some((item:any) => item.id === hotel.id);
      
      //If the new object doesn't exist, push it into the array
      if (!exists) {
        currentWishlist.push(hotel);
        this.wishListSubject.next(currentWishlist);
        // Store updated wishlist in localStorage
        this.saveWishlistToStorage(currentWishlist);
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: 'success',
          timerProgressBar: false,
          timer: 3000,
          title: 'Added successfully'
        })
      }else{
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: 'error',
          timerProgressBar: false,
          timer: 3000,
          title: 'Alreadey exist'
        })
      }
    }
  }

  getWishlist(){
    return this.getWishlistFromStorage();
  }

  getWishListIObservable() {
    return this.wishListSubject.asObservable();
  }

  private getWishlistFromStorage(){
    const wishlistJSON = localStorage.getItem(this.storageKey);
    return wishlistJSON ? JSON.parse(wishlistJSON) : [];
  }

  private saveWishlistToStorage(wishlist: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(wishlist));
  }

  removeWishList(hotel:any){
    const currentWishlist = this.getWishlistFromStorage();
    let indexRemove; let itemList;
    const exists = currentWishlist.some((item:any, index:number) => {
      indexRemove = index;
      itemList = item;
      return item.id === hotel.id;
    });
    //
    if(exists){
      currentWishlist.splice(indexRemove, 1);
      //
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: 'success',
        timerProgressBar: false,
        timer: 3000,
        title: 'Removed successfully'
      })
      //console.log("matched item ", indexRemove, currentWishlist);
      localStorage.setItem(this.storageKey, JSON.stringify(currentWishlist));
    }
  }

}
