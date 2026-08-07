import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardContent, IonFooter,
  IonIcon, IonButton, IonList, IonItem, IonAvatar, IonLabel,
  IonTabBar, IonTabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mapOutline, timeOutline, leafOutline, homeOutline, addOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardContent, IonFooter,
    IonIcon, IonButton, IonList, IonItem, IonAvatar, IonLabel,
    IonTabBar, IonTabButton
  ],
})
export class HomePage {
  // Mock Data for UI
  user = {
    name: 'Juan Lázaro',
    points: '2,540',
    avatarUrl: 'https://i.pravatar.cc/150?u=juan'
  };

  weeklyGoal = {
    current: 7.5,
    max: 10,
    percentage: 75
  };

  recentActivity = [
    { type: 'Plástico', weight: '12kg', points: '+120 pts', color: 'success' },
    { type: 'Cartón', weight: '5kg', points: '+50 pts', color: 'tertiary' },
    { type: 'Vidrio', weight: '3kg', points: '+30 pts', color: 'warning' },
  ];

  constructor() {
    addIcons({ mapOutline, timeOutline, leafOutline, homeOutline, addOutline });
  }
}
