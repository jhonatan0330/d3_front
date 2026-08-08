import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { formatImageUrl, ImageFormatPipe } from './local-image';
import { LocalStoreService } from './local-store.service';

const mockLs = {
  getItem: () => 'http://server',
} as unknown as LocalStoreService;

describe('formatImageUrl', () => {
  it('returns the url unchanged when empty', () => {
    expect(formatImageUrl(mockLs, '')).toBe('');
  });

  it('adds http:// to www. urls', () => {
    expect(formatImageUrl(mockLs, 'www.example.com/img.png')).toBe(
      'http://www.example.com/img.png'
    );
  });

  it('keeps http(s) urls unchanged', () => {
    expect(formatImageUrl(mockLs, 'https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png'
    );
  });

  it('prepends the server /files path for relative urls', () => {
    expect(formatImageUrl(mockLs, '/docs/x.png')).toBe(
      'http://server/files/docs/x.png'
    );
  });
});

describe('ImageFormatPipe', () => {
  it('delegates to formatImageUrl using the injected LocalStoreService', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: LocalStoreService, useValue: mockLs }],
    });
    const pipe = new ImageFormatPipe(TestBed.inject(LocalStoreService));
    expect(pipe.transform('/a.png')).toBe('http://server/files/a.png');
  });
});

@Component({
  standalone: true,
  imports: [ImageFormatPipe],
  template: `<span id="img">{{ '/x.png' | imageFormat }}</span>`,
})
class HostComponent {}

describe('ImageFormatPipe (template)', () => {
  it('renders the formatted url', () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: LocalStoreService, useValue: mockLs }],
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('#img').textContent
    ).toBe('http://server/files/x.png');
  });
});
