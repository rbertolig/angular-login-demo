import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../models/usuario.model';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // raiz de la url de la api de firebase
  private url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty';
  // mi api key de firebase para esta aplicacion
  private apikey = 'poner-api-aqui';

  // almacenera el token de sesion de usuario autenticado
  userToken: string;

  // Url para Crear nuevo usuario de la API Firebase
  // https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=[API_KEY]


  // Url para Login de la API Firebase
  // https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=[API_KEY]


  constructor( private http: HttpClient ) {
    this.leerToken(); // leer eltoken de sesion del usuario al cargar la aplicacion
  }


  logout() {
    // basta con borrar el token en localstorage
    localStorage.removeItem('token');
  }

  login( usuario: UsuarioModel ) {
    // las propiedades del objeto usuario a enviar seran las mismas del modelo local
    // usuario.nombre, usuario.email, usuario.password, se resume en '...usuario'
    const authData = {
      ...usuario,
      returnSecureToken: true
    };
    // hacemos un POST a la api de autenticacion del servidor de firebase
    // con los datos del usuario a registrar ( el API key es lo unico que require firebase para acerptarlo)
    // se regresara un observable a capturar con .subscribe
    return this.http.post(
      `${ this.url }/verifyPassword?key=${ this.apikey }`,
      authData
    // con un pipe(map =>resp{metodo()}) el 'metodo' maneja guardar el toke de respuesta
    ).pipe(
      map( resp => {
        this.guardarToken( resp['idToken'] );
        return resp; // y retorna la respuesta completa al subscribe que llamo a login()
      })
    );

  }

  nuevoUsuario( usuario: UsuarioModel ) {

    const authData = {
      // las propiedades del objeto usuario a enviar seran las mismas del modelo local
      // usuario.nombre, usuario.email, usuario.password, se resume en '...usuario'
      ...usuario, // esto es lo mismo que clonar el modelo usuario que ya tenemos
      returnSecureToken: true
    };
    // hacemos un POST a la api de autenticacion del servidor de firebase
    // con los datos del usuario a registrar ( el API key es lo unico que require firebase para acerptarlo)
    // se regresara un observable a capturar con .subscribe
    return this.http.post(
      `${ this.url }/signupNewUser?key=${ this.apikey }`,
      authData
    // con un pipe(map =>resp{metodo()}) el 'metodo' maneja guardar el toke de respuesta
    ).pipe(
      map( resp => {
        this.guardarToken( resp['idToken'] );
        return resp; // y retorna la respuesta completa al subscribe que llamo a NuevoUsuario()
      })
    );

  }

  // aqui guardamos el toek de la sesion del usuario
  private guardarToken( idToken: string ) {
    // ponemos en una propiedad el token que se recibe desde el post a la api de firebase
    this.userToken = idToken;
    // guardamos el token en el 'localStorage' del navegador web con la llave: token
    localStorage.setItem('token', idToken);
    // guardamos tambien el tiempo de expiracion que es 1 hora
    let hoy = new Date();
    hoy.setSeconds( 3600 );
    // aqui se guarda con la llave 'expira' y convertido a string
    // local storage solo guarda strings
    localStorage.setItem('expira', hoy.getTime().toString() );


  }

  // aqui leemos el token desde localstorage
  leerToken() {
    // si existe token en localstorage
    if ( localStorage.getItem('token') ) {
      // lo extraemmos con su llave 'token'
      this.userToken = localStorage.getItem('token');
    } else {
      // sino lo inicializo vacio
      this.userToken = '';
    }
    // retorno el token si existia o cadena vacia
    return this.userToken;

  }

  // validar si el usuario esta autenticado retornando true sino retorna false
  estaAutenticado(): boolean {
    // si tiene un token vacio es que no
    if ( this.userToken.length < 2 ) {
      return false;
    }
    // recuperar tiempo de expiracion del token desde LocalStorage
    const expira = Number(localStorage.getItem('expira')); // convertido a numero
    const expiraDate = new Date();
    expiraDate.setTime(expira); // recontruir la expiracion en una fecha completa valida
    // si la fecha y hora de expiracion es mayor que la actual es que esta vigente el token
    if ( expiraDate > new Date() ) {
      return true; // si es valido rertornar true sino falso
    } else {
      return false;
    }


  }


}
