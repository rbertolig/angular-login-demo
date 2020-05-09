import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { UsuarioModel } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  usuario: UsuarioModel = new UsuarioModel();
  recordarme = false;

  constructor( private auth: AuthService,
               private router: Router ) { }

  ngOnInit() {
    // validad si existe el email del usuario en el local storage
    // para cargarlo en el campo de login y restaurar el cotejo en 'recordarme'
    if ( localStorage.getItem('email') ) {
      this.usuario.email = localStorage.getItem('email');
      this.recordarme = true;
    }

  }


  login( form: NgForm ) {
    // si ocurre un submit del form en el html pero no era valido algun dato del form regresa al form html sin hacer nada
    if (  form.invalid ) { return; }
    // paquete sweetAlert2 para mostrar ventana emergente con mensaje
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor...'
    });
    Swal.showLoading(); // mostrar icono loading


    this.auth.login( this.usuario )
      .subscribe( resp => {

        console.log(resp);
        Swal.close(); // cerrar el swal box
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
