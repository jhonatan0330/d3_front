import { Component, OnInit } from '@angular/core';
import { PostPreguntaDTO, PostRespuestaDTO } from 'app/model/sw42.domain';
import { SurveyService } from 'app/service/survey.service';

@Component({
  selector: 'app-help-faq',
  templateUrl: './help-faq.component.html',
  styleUrls: ['./help-faq.component.scss'],
})
export class HelpFaqComponent implements OnInit {

  preguntas: PostPreguntaDTO[] =[];

  constructor(private survey: SurveyService) {}

  ngOnInit(): void {
    this.survey.getFAQ().subscribe((value: PostPreguntaDTO[]) => {
      this.preguntas = value;
    });
  }

  loadResponse(message: PostPreguntaDTO) {
    const p = this.preguntas.find(x => x.llaveTabla === message.llaveTabla);
    if(p && !p.respuestas){
      this.survey.getFAQResponse(p.llaveTabla).subscribe((value: PostRespuestaDTO[]) => {
        p.respuestas = value;
      });
    }
  }
}
