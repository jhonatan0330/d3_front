import { Component, OnInit } from '@angular/core';

import Swal from 'sweetalert2';
import { EncuestaDTO, EncuestaGrupoDTO, EncuestaPreguntaDTO, EncuestaOpcionRespuestaDTO, EncuestaRespuestaDTO } from 'app/survey/survey.domain';
import { SurveyService } from '../survey.service';

@Component({
  selector: 'app-votar',
  templateUrl: './votar.component.html'
})
export class VotarComponent implements OnInit {
  encuestas: EncuestaDTO[] = [];
  encuesta: EncuestaDTO;
  grupo: EncuestaGrupoDTO;
  pregunta: EncuestaPreguntaDTO;
  opcion: EncuestaOpcionRespuestaDTO;
  respuestas: EncuestaRespuestaDTO[];

  index = 0;
  isLoading = false;

  constructor(
    private survey: SurveyService,
    ) {}

  ngOnInit(): void {
    this.survey.encuestasDisponibles().subscribe((value: EncuestaDTO[]) => {
        this.encuestas = value;
        this.startSurvey();
    });
  }

  startSurvey() {
    if (this.encuestas && this.encuestas.length !== 0) {
      this.encuesta = this.encuestas[0];
      this.startGroup();
    } else {
      this.salir();
    }
  }

  startGroup() {
    if (this.encuesta && this.encuesta.grupos && this.encuesta.grupos.length !== 0) {
      this.grupo = this.encuesta.grupos[0];
      this.respuestas = [];
      for (let i = 0; i < this.grupo.preguntas.length; i++) {
        const nRespuesta = new EncuestaRespuestaDTO();
        nRespuesta.pregunta = this.grupo.preguntas[i].llaveTabla;
        this.respuestas.push(nRespuesta);
      }
      this.startQuestion();
    } else {
      this.encuestas.splice(0, 1);
      this.startSurvey();
    }
  }

  startQuestion() {
    if (this.grupo && this.grupo.preguntas && this.grupo.preguntas.length !== 0) {
      this.pregunta = this.grupo.preguntas[0];
      this.selectQuestion(0);
    } else {
      this.encuesta.grupos.splice(0, 1);
      this.startGroup();
    }
  }

  selectQuestion(pIndex) {
    if (pIndex < this.grupo.preguntas.length) {
      this.pregunta = this.grupo.preguntas[pIndex];
      this.index = pIndex;
      const _respuesta = this.respuestas.find(element => element.pregunta === this.pregunta.llaveTabla);
      if (_respuesta.respuestaOpcion) {
        this.opcion = this.pregunta.opciones.find(opcion => opcion.llaveTabla === _respuesta.respuestaOpcion);
      } else {
        this.opcion = null;
      }
    } else {
      this.terminar();
    }
  }

  choose(pOpcion: EncuestaOpcionRespuestaDTO) {
    const _respuesta = this.respuestas.find(element => element.pregunta === this.pregunta.llaveTabla);
    this.opcion = pOpcion;
    if (pOpcion) {
      _respuesta.respuestaOpcion = pOpcion.llaveTabla;
    } else {
      _respuesta.respuestaOpcion = null;
    }
    window.scrollTo(0, 0);
  }

  next() {
    this.index++;
    this.selectQuestion(this.index);
  }

  back() {
    this.index--;
    this.selectQuestion(this.index);
  }

  terminar() {
    Swal.fire({
      title: 'Has terminado',
      text: 'Estas seguro de tus respuestas!',
      showCancelButton: true,
      confirmButtonText: `Si estoy seguro`,
      cancelButtonText: `Deseo revisarlas de nuevo`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.grupo.respuestas = this.respuestas;
        this.isLoading = true;
        this.survey.responseGroupSurvey(this.grupo).subscribe(() => {
            this.encuesta.grupos.splice(0, 1);
            this.isLoading = false;
            this.startGroup();
        });
      }
    })
  }

  salir() {
    Swal.fire('Proceso completo', 'Muchas Gracias por tu participacion', 'success').
      then(() => {
        /*if (this.navService.iconMenu.length === 0) {
          this.jwtAuth.signout();
          this.templateService.clear();
        } else {
          this.router.navigateByUrl('/main');
        }*/
      });
  }
}
