import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'teams',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/teams/teams.component').then(m => m.TeamsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/teams/create-team/create-team.component').then(m => m.CreateTeamComponent),
        canActivate: [AuthGuard, AdminGuard]
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/teams/team-details/team-details.component').then(m => m.TeamDetailsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/teams/edit-team/edit-team.component').then(m => m.EditTeamComponent),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'ceremonies',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/ceremonies/ceremonies.component').then(m => m.CeremoniesComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/ceremonies/create-ceremony/create-ceremony.component').then(m => m.CreateCeremonyComponent),
        canActivate: [AuthGuard]
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/ceremonies/edit-ceremony/edit-ceremony.component').then(m => m.EditCeremonyComponent),
        canActivate: [AuthGuard]
      },
      {
        path: ':id/questions',
        loadComponent: () => import('./pages/ceremonies/ceremony-questions/ceremony-questions.component').then(m => m.CeremonyQuestionsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: ':id/respond',
        loadComponent: () => import('./pages/ceremonies/ceremony-response/ceremony-response.component').then(m => m.CeremonyResponseComponent),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'companies',
        loadComponent: () => import('./pages/admin/companies/companies.component').then(m => m.CompaniesComponent)
      },
      {
        path: 'integrations',
        loadComponent: () => import('./pages/admin/integrations/integrations.component').then(m => m.IntegrationsComponent)
      }
    ]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
