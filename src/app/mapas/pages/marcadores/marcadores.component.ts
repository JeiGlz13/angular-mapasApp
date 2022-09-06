import {
  Component, ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl'

interface CustomMarker {
  color: string;
  marker?: mapboxgl.Marker;
  center?: [number, number];
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
      .mapa-container {
        height: 100%;
        width: 100%;
      }

      .list-group{
        position: fixed;
        top: 1rem;
        right: 1.5rem;
        z-index: 99;
      }

      li {
        cursor: pointer;
      }
    `
  ],
})
export class MarcadoresComponent implements AfterViewInit {

  @ViewChild('mapa') divMapa!: ElementRef;
  public mapa!: mapboxgl.Map;
  public zoomLevel: number = 15;
  public center: [number, number] = [-86.20472428033499, 11.909189245964184];
  public marcadores: CustomMarker[] = [];

  constructor() { }

  ngAfterViewInit(): void {
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel,
    });

    this.leerLocalStorage();

    // const markerHtml: HTMLElement = document.createElement('div');
    // markerHtml.innerHTML = 'Hola Mundo';

    // const marker = new mapboxgl.Marker()
    //   .setLngLat(this.center)
    //   .addTo(this.mapa);

  }

  agregarMarcador(){
    const color = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));

    const nuevoMarcador = new mapboxgl.Marker({
      draggable: true,
      color,
    })
      .setLngLat(this.center)
      .addTo(this.mapa);

    this.marcadores.push({
      color,
      marker: nuevoMarcador,
    });

    this.guardarMarcadoresLocalStorage();

    nuevoMarcador.on('dragend', () => {
      this.guardarMarcadoresLocalStorage();
    });
  }

  viajarMarcador(marcador: mapboxgl.Marker){
    const {lat, lng} = marcador.getLngLat();
    this.mapa.flyTo({
      center: [lng, lat],
      zoom: 16
    });
  }

  guardarMarcadoresLocalStorage(){
    const lngLatArr: CustomMarker[] = [];

    this.marcadores.forEach((marcador) => {
      const color = marcador.color;
      const { lng, lat } = marcador.marker!.getLngLat();

      lngLatArr.push({
        color,
        center: [lng, lat]
      });
    });

    localStorage.setItem('marcadores', JSON.stringify(lngLatArr))
  }

  leerLocalStorage(){
    if (!localStorage.getItem('marcadores')) return;

    const lngLatArr: CustomMarker[] = JSON.parse(localStorage.getItem('marcadores')!);

    lngLatArr.forEach((marcador) => {
      const newMarker = new mapboxgl.Marker({
        color: marcador.color,
        draggable: true,
      })
        .setLngLat(marcador.center!)
        .addTo(this.mapa);

      this.marcadores.push({
        marker: newMarker,
        color: marcador.color,
      });

      newMarker.on('dragend', () => {
        this.guardarMarcadoresLocalStorage();
      });
    });
  }

  borrarMarcador(index: number){
    this.marcadores[index].marker?.remove();
    this.marcadores.splice(index, 1);
    this.guardarMarcadoresLocalStorage();
  }
}
