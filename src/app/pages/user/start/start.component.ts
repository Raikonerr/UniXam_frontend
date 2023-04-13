import { LocationStrategy } from '@angular/common';
import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css'],
})
export class StartComponent implements OnInit {
  id;
  questions;

  marksGot: number  = 0;
  correctAnswers = 0;
  attempted = 0;

  isSubmit = false;

  timer: any;

  constructor(
    private locationSt: LocationStrategy,
    private _route: ActivatedRoute,
    private _question: QuestionService,
    private _quiz: QuizService
  ) {}

  ngOnInit(): void {
    this.preventBackButton();
    this.id = this._route.snapshot.params.id;
    console.log(this.id);
    this.loadQuestions();
  }
  loadQuestions() {
    this._question.getQuestionsOfQuizForTest(this.id).subscribe(
      (data: any) => {
        this.questions = data;

        // Debug: Log maxMarks for each question
        this.questions.forEach((q, index) => {
          console.log(`Question ${index + 1} maxMarks:`, q.quiz.maxMarks);
        });

        this.timer = this.questions.length * 2 * 60;

        console.log(this.questions);
        this.startTimer();
      },

      (error) => {
        console.log(error);
        Swal.fire('Error', 'Error in loading questions of quiz', 'error');
      }
    );
  }

  preventBackButton() {
    history.pushState(null, null, location.href);
    this.locationSt.onPopState(() => {
      history.pushState(null, null, location.href);
    });
  }

  submitQuiz() {
    Swal.fire({
      title: 'Do you want to submit the quiz?',
      showCancelButton: true,
      confirmButtonText: `Submit`,
      icon: 'info',
    }).then((e) => {
      if (e.isConfirmed) {
        this.evalQuiz();
      }
    });
  }

  startTimer() {
    const t = window.setInterval(() => {
      // code
      if (this.timer <= 0) {
        this.evalQuiz();
        clearInterval(t);
      } else {
        this.timer--;
      }
    }, 1000);
  }
  // Add this method to your component class
  printResult() {
    const printContents = document.getElementById('result-card').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
  }


  getFormattedTime() {
    const hh = Math.floor(this.timer / 3600);
    const mm = Math.floor(this.timer / 60);
    const ss = this.timer - mm * 60;
    return `${hh} hour : ${mm} min : ${ss} sec`;
  }

  getQuestionResponses() {
    return this.questions.map((question) => {
      return {
        questionId: question.id,
        userResponse: question.givenAnswer,
      };
    });
  }

  evalQuiz() {
    // Reset the variables before processing
    this.marksGot = 0;
    this.correctAnswers = 0;
    this.attempted = 0;

    // ... Rest of the code

    this._question
      .evalQuiz(this.getQuestionResponses())
      .subscribe(
        (data: any) => {
          console.log(data);

          // tslint:disable-next-line:radix
          const totalMaxMarks: number = this.questions.reduce((acc, q): number => acc + parseInt(q.quiz.maxMarks), 0);
          const marksPerQuestion: number = totalMaxMarks / this.questions.length;

          console.log('totalMaxMarks:', totalMaxMarks);
          console.log('marksPerQuestion:', marksPerQuestion);

          this.questions.forEach((q) => {
            console.log('Question:', q);
            if (q.givenAnswer == q.answer) {
              this.correctAnswers++;
              this.marksGot = this.marksGot + marksPerQuestion;
              console.log('Correct answer, updated marksGot:', this.marksGot);
            }
            if (q.givenAnswer.trim() != '') {
              this.attempted++;
            }
          });

          this.marksGot = Math.floor(this.marksGot);

          this.isSubmit = true;
        },
        (error) => {
          console.log(error);
        }
      );
    // this.isSubmit = true;
    // this.questions.forEach((q) => {
    //   if (q.givenAnswer == q.answer) {
    //     this.correctAnswers++;
    //     let marksSingle =
    //       this.questions[0].quiz.maxMarks / this.questions.length;
    //     this.marksGot += marksSingle;
    //   }
    //   if (q.givenAnswer.trim() != '') {
    //     this.attempted++;
    //   }
    // });
    // console.log('Correct Answers :' + this.correctAnswers);
    // console.log('Marks Got ' + this.marksGot);
    // console.log('attempted ' + this.attempted);
    // console.log(this.questions);
  }
}
