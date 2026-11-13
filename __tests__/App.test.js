import React from 'react';
import { render, screen } from '@testing-library/react-native';

import App, { PARAMS, validarParametros } from '../App';

// cópia funda pra cada teste poder estragar o que quiser sem afetar os outros
const copiar = () => JSON.parse(JSON.stringify(PARAMS));

describe('validarParametros', () => {
  it('não acusa nada com o PARAMS original', () => {
    expect(validarParametros(PARAMS)).toEqual([]);
  });

  it('recusa quando não recebe um objeto', () => {
    expect(validarParametros(undefined)).toEqual(['PARAMS não foi definido ou não é um objeto.']);
    expect(validarParametros([])).toHaveLength(1);
  });

  it('acusa largura e altura inválidas', () => {
    const p = copiar();
    p.largura = -10;
    p.altura = '220';

    expect(validarParametros(p)).toEqual([
      'largura precisa ser um número maior que zero (veio -10).',
      'altura precisa ser um número maior que zero (veio "220").',
    ]);
  });

  it('acusa cor inválida no tema', () => {
    const p = copiar();
    p.tema.gradienteFim = 'azulzinho';

    expect(validarParametros(p)).toContain(
      'tema.gradienteFim não é uma cor válida, use hex ou rgb/rgba (veio "azulzinho").',
    );
  });

  it('acusa seção que está faltando', () => {
    const p = copiar();
    delete p.barra;

    expect(validarParametros(p)).toEqual(['barra está faltando ou não é um objeto.']);
  });

  it('acusa meses e vendas com tamanhos diferentes', () => {
    const p = copiar();
    p.vendas.pop();

    expect(validarParametros(p)).toEqual([
      'meses tem 6 itens e vendas tem 5, as duas listas precisam ter o mesmo tamanho.',
    ]);
  });

  it('acusa vendas com valor que não é número', () => {
    const p = copiar();
    p.vendas[2] = 'vinte';

    expect(validarParametros(p)[0]).toMatch(/^vendas precisa ser uma lista de números/);
  });

  it('acusa progresso fora do intervalo 0 a 1', () => {
    const p = copiar();
    p.progresso.valores = [0.5, 1.5];

    expect(validarParametros(p)).toEqual([
      'progresso.valores precisa ser uma lista de números entre 0 e 1 (veio [0.5,1.5]).',
    ]);
  });

  it('acusa cor rgb fora do limite', () => {
    const p = copiar();
    p.linha.cor = [0, 0, 300];

    expect(validarParametros(p)).toEqual([
      'linha.cor precisa ser [r, g, b] com inteiros de 0 a 255 (veio [0,0,300]).',
    ]);
  });

  it('acusa problemas nas fatias da pizza', () => {
    const p = copiar();
    p.pizza.fatias[1].cor = 'vermelho';
    p.pizza.fatias[3].nome = '';

    expect(validarParametros(p)).toEqual([
      'pizza.fatias[1].cor não é uma cor válida (veio "vermelho").',
      'pizza.fatias[3].nome precisa ser um texto não vazio.',
    ]);
  });

  it('acusa pizza com todas as fatias zeradas', () => {
    const p = copiar();
    p.pizza.fatias.forEach((f) => {
      f.valor = 0;
    });

    expect(validarParametros(p)).toEqual([
      'pizza.fatias precisa ter pelo menos uma fatia com valor maior que zero.',
    ]);
  });

  it('junta vários erros de uma vez', () => {
    const p = copiar();
    p.altura = 0;
    p.estilo.tamanhoTitulo = null;
    p.barra.prefixoEixoY = 5;
    p.pizza.mostrarAbsoluto = 'sim';

    expect(validarParametros(p)).toHaveLength(4);
  });
});

describe('App', () => {
  it('mostra os quatro gráficos quando o PARAMS está certo', async () => {
    await render(<App />);

    expect(screen.getByText('Gráfico de Linha')).toBeOnTheScreen();
    expect(screen.getByText('Gráfico de Progresso')).toBeOnTheScreen();
    expect(screen.getByText('Gráfico de Pizza')).toBeOnTheScreen();
    expect(screen.getByText('Gráfico de Barra')).toBeOnTheScreen();
    expect(screen.queryByText('Não foi possível montar os gráficos')).toBeNull();
  });

  it('mostra os erros no lugar dos gráficos quando algo está errado', async () => {
    const p = copiar();
    p.largura = 0;
    p.pizza.fatias[0].cor = 'xyz';

    await render(<App params={p} />);

    expect(screen.getByText('Não foi possível montar os gráficos')).toBeOnTheScreen();
    expect(screen.getByText('Corrija os 2 problemas abaixo no objeto PARAMS:')).toBeOnTheScreen();
    expect(screen.getByText('• largura precisa ser um número maior que zero (veio 0).')).toBeOnTheScreen();
    expect(screen.getByText('• pizza.fatias[0].cor não é uma cor válida (veio "xyz").')).toBeOnTheScreen();
    expect(screen.getAllByTestId('erro-parametro')).toHaveLength(2);

    expect(screen.queryByText('Gráfico de Linha')).toBeNull();
    expect(screen.queryByText('Gráfico de Barra')).toBeNull();
  });

  it('usa o singular quando só tem um erro', async () => {
    const p = copiar();
    p.tema.casasDecimais = 1.5;

    await render(<App params={p} />);

    expect(screen.getByText('Corrija o problema abaixo no objeto PARAMS:')).toBeOnTheScreen();
    expect(
      screen.getByText('• tema.casasDecimais precisa ser um inteiro maior ou igual a zero (veio 1.5).'),
    ).toBeOnTheScreen();
  });
});
