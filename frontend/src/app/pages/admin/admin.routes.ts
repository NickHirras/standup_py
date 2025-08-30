import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { UsersComponent } from './users/users.component';
import { CompaniesComponent } from './companies/companies.component';
import { TeamsComponent } from './teams/teams.component';
import { IntegrationsComponent } from './integrations/integrations.component';
import { SystemComponent } from './system/system.component';
import { ReportsComponent } from './reports/reports.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminComponent },
      { path: 'users', component: UsersComponent },
      { path: 'companies', component: CompaniesComponent },
      { path: 'teams', component: TeamsComponent },
      { path: 'integrations', component: IntegrationsComponent },
      { path: 'system', component: SystemComponent },
      { path: 'reports', component: ReportsComponent }
    ]
  }
];
