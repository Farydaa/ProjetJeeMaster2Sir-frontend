import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, RouterLink]
})
export class DashboardComponent implements OnInit {
  totalEntretiens: number = 0;
  moyenneGenerale: number = 0;
  derniersResultats: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // Désactivé temporairement pour tester
    // if (!this.authService.isLoggedIn()) {
    //   this.router.navigate(['/login']);
    //   return;
    // }
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Données fictives pour tester l'interface
    this.totalEntretiens = 12;
    this.moyenneGenerale = 85.5;
    this.derniersResultats = [
      { date: '2024-06-01', poste: 'Développeur Java', score: 92 },
      { date: '2024-05-28', poste: 'Architecte Spring', score: 78 },
      { date: '2024-05-25', poste: 'Tech Lead', score: 88 }
    ];
  }

  demarrerEntretien() {
    this.router.navigate(['/interview/chat']);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}