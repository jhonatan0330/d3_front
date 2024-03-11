import { Routes } from '@angular/router';
import { ArticleHelpComponent } from './article/article.component';


export default [
    {
        path     : ':type/:id',
        component: ArticleHelpComponent,
    }
] as Routes;
