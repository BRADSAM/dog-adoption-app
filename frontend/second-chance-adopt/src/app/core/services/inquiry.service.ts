import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, map, of, tap } from 'rxjs';
import { AdoptionInquiry, InquiryInput, InquiryStatus } from '../models/inquiry.model';
import { isoHoursAgo, uid } from '../utils/id';

/**
 * Adoption interest requests. Same pattern as DogService: BehaviorSubject now, HttpClient later.
 *   POST /api/inquiries           -> submit()
 *   GET  /api/inquiries           -> inquiries$
 *   PATCH /api/inquiries/{id}     -> setStatus()
 */
@Injectable({ providedIn: 'root' })
export class InquiryService {
  private readonly storageKey = 'cvo.inquiries.v1';

  private readonly subject = new BehaviorSubject<AdoptionInquiry[]>(this.read());

  readonly inquiries$ = this.subject.asObservable();
  readonly newCount$ = this.inquiries$.pipe(map((list) => list.filter((i) => i.status === 'New').length));

  submit(input: InquiryInput): Observable<AdoptionInquiry> {
    const inquiry: AdoptionInquiry = {
      ...input,
      id: uid(),
      createdAt: new Date().toISOString(),
      status: 'New',
    };
    return of(inquiry).pipe(
      delay(900),
      tap((created) => this.commit([created, ...this.subject.value])),
    );
  }

  setStatus(id: string, status: InquiryStatus): void {
    this.commit(this.subject.value.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  private commit(next: AdoptionInquiry[]): void {
    this.subject.next(next);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(next));
    } catch {
      /* Ignore storage failures. */
    }
  }

  private read(): AdoptionInquiry[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as AdoptionInquiry[];
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      /* Fall through to seed data. */
    }
    return this.seed();
  }

  private seed(): AdoptionInquiry[] {
    return [
      {
        id: 'q-1',
        dogId: 'd-pilot',
        dogName: 'Pilot',
        fullName: 'Amina Wanjiru',
        email: 'amina.wanjiru@example.com',
        phone: '+254 712 345 678',
        message:
          'We have a fenced compound and two teenagers who have wanted a German Shepherd for years. I work from home most days.',
        createdAt: isoHoursAgo(5),
        status: 'New',
      },
      {
        id: 'q-2',
        dogId: 'd-juniper',
        dogName: 'Juniper',
        fullName: 'Daniel Otieno',
        email: 'daniel.otieno@example.com',
        phone: '+254 723 456 789',
        message: 'I lost my Labrador last year and I am ready for another dog. Juniper sounds like the right fit.',
        createdAt: isoHoursAgo(26),
        status: 'Contacted',
      },
      {
        id: 'q-3',
        dogId: 'd-maple',
        dogName: 'Maple',
        fullName: 'Grace Mutheu',
        email: 'grace.mutheu@example.com',
        phone: '+254 734 567 890',
        message: 'I live in a quiet flat and would love a calm older dog for company. I have owned small dogs before.',
        createdAt: isoHoursAgo(52),
        status: 'New',
      },
    ];
  }
}
