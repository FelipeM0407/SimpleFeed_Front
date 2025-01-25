import { Routes } from '@angular/router';
import { FeedbackFormComponent } from './components/feedback-form/feedback-form.component';
const routes: Routes = [
  {
    path: ':formId',
    component: FeedbackFormComponent,
  },
];
export class FeedbackSubmissionModule { }
