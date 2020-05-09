import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { UsuarioModel } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {

  usuario: UsuarioModel;
  recordarme = false;

  constructor( private auth: AuthService,
               private router: Router ) { }

  ngOnInit() {
    // asegura un objeto usuario nuevo vacio cuando carga la aplicacion
    this.usuario = new UsuarioModel();
  }

  onSubmit( form: NgForm ) {
    // solo continua si el form en html fue validado previavente por ngForm
    if ( form.invalid ) { return; }
    // paquete sweetAlert2 para mostrar ventana emergente con mensaje
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor...'
    });
    Swal.showLoading(); // no muestra boton solo icono 'loading'
    // llamar a funcion que realiza el POST a la API de firebase para registrar alli el nuevo usuario
    this.auth.nuevoUsuario( this.usuario )
      .subscribe( resp => {

        console.log(resp);
        Swal.close(); // cerrar el sweetalert box

        // si estaba cotejada el check de recordar usuario graba el usuario en el local storage para persistencia
        if ( this.recordarme ) {
          localStorage.setItem('email', this.usuario.email);
        }

        this.router.navigateByUrl('/home');

      }, (err) => {
        console.log(err.error.error.message);
        // paquete sweetAlert2 para mostrar ventana emergente con mensaje
        Swal.fire({
          icon: 'error',
          title: 'Error al autenticar',
          text: err.error.error.message
        });
      });
  }


}
