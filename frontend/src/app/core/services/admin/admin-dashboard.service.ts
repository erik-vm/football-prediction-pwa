import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';

export interface DashboardStats {
  totalUsers: number;
  activeTournaments: number;
  matchesToday: number;
  pendingResults: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  timestamp: Date;
  details: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard/stats`);
  }

  getRecentActivity(): Observable<ApiResponse<RecentActivity[]>> {
    return this.http.get<ApiResponse<RecentActivity[]>>(`${this.apiUrl}/dashboard/activity`);
  }
}
