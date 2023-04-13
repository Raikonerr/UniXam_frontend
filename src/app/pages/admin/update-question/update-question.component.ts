import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {QuestionService} from '../../../services/question.service';
import Swal from 'sweetalert2';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-update-question',
  templateUrl: './update-question.component.html',
  styleUrls: ['./update-question.component.css']
})
export class UpdateQuestionComponent implements OnInit {

  public Editor = ClassicEditor;
  id;
  title;
  question = {
    quiz : {},
    content: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    answer: '',
  };
  constructor(
    private _route : ActivatedRoute,
    private _question: QuestionService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.id = this._route.snapshot.params.id;
    this.title = this._route.snapshot.params.title;
    this.question.quiz['id'] = this.id;
    this._question.getQuestionsOfQuiz(this.id).subscribe(
      (data: any) => {
        this.question = data;
        this.question.quiz['id'] = this.id;
        console.log(this.question);
      },
    );
    console.log('ID:', this.id);
    console.log('Title:', this.title);
  }
  updateQuestion(){
    this._question.updateQuestion(this.question).subscribe(
      (data: any) => {
        Swal.fire('Success !!', 'Question updated', 'success').then((e)=>{
          this._router.navigate(['/admin/quizzes']);
        });
      },
      (error ) => {
        Swal.fire('Error', 'error in updating quiz', 'error');
        console.log(error);
      }
    );
  }

}

