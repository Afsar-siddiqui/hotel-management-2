import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent {

  @Input() lat: number=0;
  @Input() lng: number=0;

  display: any;
  center: google.maps.LatLngLiteral = {
      lat: this.lat,
      lng: this.lng
  };
  zoom = 6;

  constructor(){}

  ngOnInit() {
    
  }


  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = (event.latLng.toJSON());
  }

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }

  

}
