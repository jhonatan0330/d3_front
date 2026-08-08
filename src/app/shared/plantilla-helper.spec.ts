import { PlantillaHelper, MVCTranslate } from './plantilla-helper';
import { PropiedadDTO } from './shared.domain';

describe('PlantillaHelper', () => {
  const props: PropiedadDTO[] = [
    { key: 'COLOR', valor: '#ff0000' },
    { key: 'INVISIBLE', valor: 'true' },
  ];

  it('buscarPropiedad returns the matching property', () => {
    const found = PlantillaHelper.buscarPropiedad(props, 'COLOR');
    expect(found).not.toBeNull();
    expect(found!.valor).toBe('#ff0000');
  });

  it('buscarPropiedad returns undefined when the key is absent', () => {
    expect(PlantillaHelper.buscarPropiedad(props, 'NO_EXISTE')).toBeUndefined();
  });

  it('buscarPropiedad returns null for undefined properties', () => {
    expect(PlantillaHelper.buscarPropiedad(undefined, 'COLOR')).toBeNull();
  });

  it('buscarValor returns the value or an empty string', () => {
    expect(PlantillaHelper.buscarValor(props, 'COLOR')).toBe('#ff0000');
    expect(PlantillaHelper.buscarValor(props, 'NO_EXISTE')).toBe('');
  });

  it('buscarValorMultiple returns matching properties or null', () => {
    const found = PlantillaHelper.buscarValorMultiple(props, 'COLOR');
    expect(found).not.toBeNull();
    expect(found!.length).toBe(1);
    expect(PlantillaHelper.buscarValorMultiple(props, 'NO_EXISTE')).toBeNull();
  });

  it('isEmpty is true when the property is absent', () => {
    expect(PlantillaHelper.isEmpty(props, 'NO_EXISTE')).toBe(true);
    expect(PlantillaHelper.isEmpty(props, 'COLOR')).toBe(false);
  });

  it('agregarPropiedad appends a new property', () => {
    const list = PlantillaHelper.agregarPropiedad([], 'KEY', 'V');
    expect(list.length).toBe(1);
    expect(list[0].key).toBe('KEY');
    expect(list[0].valor).toBe('V');
  });
});

describe('MVCTranslate', () => {
  it('adds two numbers', () => {
    expect(MVCTranslate.calculateText('2+3')).toBe('5');
  });

  it('subtracts two numbers', () => {
    expect(MVCTranslate.calculateText('10-4')).toBe('6');
  });

  it('multiplies two numbers', () => {
    expect(MVCTranslate.calculateText('3*4')).toBe('12.00000000');
  });

  it('divides two numbers', () => {
    expect(MVCTranslate.calculateText('9/3')).toBe('3.00000000');
  });

  it('returns 0 for an empty expression', () => {
    expect(MVCTranslate.calculateText('')).toBe('0');
  });
});
