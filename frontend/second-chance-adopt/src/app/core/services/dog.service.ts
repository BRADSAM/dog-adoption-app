import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, map, of, tap, throwError, timer } from 'rxjs';
import { buildMockDogs } from '../data/mock-dogs';
import { Dog, DogInput, DogStatus } from '../models/dog.model';
import { uid } from '../utils/id';

/**
 * In-memory dog store backed by a BehaviorSubject, persisted to localStorage so admin edits survive a reload.
 *
 * To connect the Spring Boot backend, keep these method signatures and replace the bodies with HttpClient calls:
 *   GET    /api/dogs        -> dogs$ (call once in the constructor and push into dogsSubject)
 *   POST   /api/dogs        -> add()
 *   PUT    /api/dogs/{id}   -> update() / setStatus()
 *   DELETE /api/dogs/{id}   -> remove()
 */
@Injectable({ providedIn: 'root' })
export class DogService {
  private readonly storageKey = 'cvo.dogs.v1';
  private readonly latency = 450;

  private readonly dogsSubject = new BehaviorSubject<Dog[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(true);

  readonly dogs$ = this.dogsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();

  constructor() {
    // Simulate the first network round trip so loading skeletons are visible.
    timer(700).subscribe(() => {
      this.dogsSubject.next(this.read());
      this.loadingSubject.next(false);
    });
  }

  getById(id: string): Observable<Dog | undefined> {
    return this.dogs$.pipe(map((dogs) => dogs.find((d) => d.id === id)));
  }

  add(input: DogInput): Observable<Dog> {
    const dog: Dog = { ...input, id: uid(), arrivedOn: new Date().toISOString() };
    return of(dog).pipe(
      delay(this.latency),
      tap((created) => this.commit([created, ...this.dogsSubject.value])),
    );
  }

  update(id: string, changes: Partial<DogInput>): Observable<Dog> {
    const current = this.dogsSubject.value.find((d) => d.id === id);
    if (!current) {
      return throwError(() => new Error('Dog not found'));
    }
    const updated: Dog = { ...current, ...changes };
    return of(updated).pipe(
      delay(this.latency),
      tap((next) => this.commit(this.dogsSubject.value.map((d) => (d.id === id ? next : d)))),
    );
  }

  setStatus(id: string, status: DogStatus): Observable<Dog> {
    return this.update(id, { status });
  }

  remove(id: string): Observable<void> {
    return of(void 0).pipe(
      delay(this.latency),
      tap(() => this.commit(this.dogsSubject.value.filter((d) => d.id !== id))),
    );
  }

  private commit(next: Dog[]): void {
    this.dogsSubject.next(next);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(next));
    } catch {
      /* Storage can be unavailable (private mode, quota). The in-memory list still works. */
    }
  }

  private read(): Dog[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Dog[];
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      /* Fall through to seed data. */
    }
    return buildMockDogs();
  }
}
