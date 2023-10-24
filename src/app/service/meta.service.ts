import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MetaService {

  constructor(private meta: Meta, private _title: Title) { }

  updateTitle(name:string){
    this._title.setTitle(name);
  }

  addTag(name: string, content: string) {
    this.meta.addTag({ name, content });
  }

  updateTag(name: string, content: string) {
    this.meta.updateTag({ name, content });
  }

  removeTag(name: string) {
    this.meta.removeTag(`name="${name}"`);
  }
  
}
