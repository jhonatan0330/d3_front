import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { TasksService } from './task.service';
import { LocalStoreService } from 'app/shared/local-store.service';
import { Task } from './task.types';

describe('TasksService', () => {
  let service: TasksService;
  let httpMock: HttpTestingController;
  const localStorageGetUrlAccess = vi.fn().mockImplementation((path: string) => `http://api.test${path}`);

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        TasksService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: LocalStoreService,
          useValue: {
            getItem: vi.fn(),
            setItem: vi.fn(),
            getUrlAccess: localStorageGetUrlAccess,
          },
        },
      ],
    });

    service = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signals', () => {
    it('tasks signal should start null', () => {
      expect(service.tasks()).toBeNull();
    });

    it('task signal should start null', () => {
      expect(service.task()).toBeNull();
    });
  });

  describe('selectTask', () => {
    it('should set the selected task', () => {
      const mockTask: Task = { key: '1', title: 'Test', notes: null, completed: null, dueDate: null, priority: 1, order: 0 };
      service.selectTask(mockTask);
      expect(service.task()).toEqual(mockTask);
    });

    it('should clear selection with null', () => {
      service.selectTask({ key: '1', title: 'Test', notes: null, completed: null, dueDate: null, priority: 1, order: 0 });
      service.selectTask(null);
      expect(service.task()).toBeNull();
    });
  });

  describe('getTasks', () => {
    it('should fetch tasks and update signal', () => {
      const mockTasks: Task[] = [
        { key: '1', title: 'Task 1', notes: null, completed: null, dueDate: null, priority: 1, order: 0 },
        { key: '2', title: 'Task 2', notes: null, completed: null, dueDate: null, priority: 2, order: 1 },
      ];

      service.getTasks().subscribe((tasks) => {
        expect(tasks.length).toBe(2);
        expect(service.tasks()).toEqual(mockTasks);
      });

      const req = httpMock.expectOne('http://api.test/task/');
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
    });
  });

  describe('getTaskById', () => {
    it('should fetch a single task by id', () => {
      const mockTask: Task = { key: '42', title: 'Detail', notes: 'notes', completed: null, dueDate: null, priority: 1, order: 0 };

      service.getTaskById('42').subscribe((task) => {
        expect(task.key).toBe('42');
      });

      const req = httpMock.expectOne('http://api.test/task/42');
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
    });
  });

  describe('createTask', () => {
    it('should create task and add to signal', () => {
      service.createTask('New task').subscribe((id) => {
        expect(id).toBe('new-id');
        const tasks = service.tasks();
        expect(tasks).toBeTruthy();
        expect(tasks.length).toBe(1);
        expect(tasks[0].title).toBe('New task');
        expect(tasks[0].key).toBe('new-id');
      });

      const createReq = httpMock.expectOne('http://api.test/task/create');
      expect(createReq.request.method).toBe('POST');
      createReq.flush({ id: 'new-id' });
    });
  });

  describe('deleteTask', () => {
    it('should delete task and remove from signal', () => {
      const initialTasks: Task[] = [
        { key: '1', title: 'Task 1', notes: null, completed: null, dueDate: null, priority: 1, order: 0 },
        { key: '2', title: 'Task 2', notes: null, completed: null, dueDate: null, priority: 2, order: 1 },
      ];

      service.getTasks().subscribe();
      httpMock.expectOne('http://api.test/task/').flush(initialTasks);

      service.deleteTask('1').subscribe(() => {
        const tasks = service.tasks();
        expect(tasks.length).toBe(1);
        expect(tasks[0].key).toBe('2');
      });

      const deleteReq = httpMock.expectOne('http://api.test/task/delete/1');
      expect(deleteReq.request.method).toBe('POST');
      deleteReq.flush({ id: '1' });
    });
  });

  describe('updateTask', () => {
    it('should call POST to update task', () => {
      const task: Task = { key: '1', title: 'Updated', notes: null, completed: null, dueDate: null, priority: 1, order: 0 };

      service.updateTask(task).subscribe((res) => {
        expect(res.id).toBe('1');
      });

      const req = httpMock.expectOne('http://api.test/task/update');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.title).toBe('Updated');
      req.flush({ id: '1' });
    });
  });
});
