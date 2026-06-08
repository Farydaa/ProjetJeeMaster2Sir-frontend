import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [CommonModule, FormsModule, RouterLink]
})
export class ProfileComponent implements OnInit {
  user = {
    firstName: 'Ousmane',
    lastName: 'Diatta',
    email: 'oussoulagara2002@gmail.com',
    poste: 'Développeur Full Stack',
    photoUrl: ''  // Changé de string | null à string
  };

  historiqueEntretiens: any[] = [];
  selectedFile: File | null = null;
  previewUrl: string = '';  // Changé de string | null à string

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadHistorique();
  }

  loadHistorique() {
    this.historiqueEntretiens = [
      { date: '2024-06-01', poste: 'Développeur Java', score: 92, duree: '45 min' },
      { date: '2024-05-28', poste: 'Architecte Spring', score: 78, duree: '60 min' },
      { date: '2024-05-25', poste: 'Tech Lead', score: 88, duree: '50 min' },
      { date: '2024-05-20', poste: 'DevOps Engineer', score: 82, duree: '55 min' }
    ];
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
        this.user.photoUrl = this.previewUrl;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  sauvegarderProfil() {
    alert('Profil mis à jour avec succès !');
  }

  logout() {
    this.router.navigate(['/login']);
  }
}