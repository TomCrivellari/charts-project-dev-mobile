import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BarChart, LineChart, PieChart, ProgressChart } from 'react-native-chart-kit';

export const PARAMS = {
  largura: Dimensions.get('window').width - 16,
  altura: 220,

  tema: {
    fundo: '#1cc910',
    gradienteInicio: '#eff3ff',
    gradienteFim: '#efefef',
    casasDecimais: 2,
  },

  estilo: {
    margemTopo: 16,
    margemVertical: 8,
    borda: 16,
    tamanhoTitulo: 18,
  },

  // usados tanto no gráfico de linha quanto no de barra
  meses: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
  vendas: [20, 45, 28, 80, 99, 43],

  linha: {
    titulo: 'Gráfico de Linha',
    cor: [0, 0, 255],
    espessura: 1,
  },

  progresso: {
    titulo: 'Gráfico de Progresso',
    cor: [0, 0, 0],
    valores: [0.4, 0.6, 0.8],
  },

  barra: {
    titulo: 'Gráfico de Barra',
    cor: [0, 0, 0],
    prefixoEixoY: 'R$',
  },

  pizza: {
    titulo: 'Gráfico de Pizza',
    cor: [0, 0, 0],
    borda: 10,
    recuoEsquerda: 10,
    mostrarAbsoluto: true, // false mostra porcentagem
    legenda: { cor: '#7F7F7F', tamanho: 15 },
    fatias: [
      { nome: 'Juiz de Fora', valor: 600000, cor: 'rgba(131, 167, 234, 1)' },
      { nome: 'Barbacena', valor: 150000, cor: '#F00' },
      { nome: 'Santos Dumont', valor: 50000, cor: '#FFFF00' },
      { nome: 'Belo Horizonte', valor: 1600000, cor: 'rgb(0, 0, 255)' },
    ],
  },
};

// ---------- validação ----------

const ehObjeto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const ehNumero = (v) => typeof v === 'number' && Number.isFinite(v);
const ehPositivo = (v) => ehNumero(v) && v > 0;
const ehNaoNegativo = (v) => ehNumero(v) && v >= 0;
const ehTexto = (v) => typeof v === 'string' && v.trim() !== '';
const ehRGB = (v) =>
  Array.isArray(v) && v.length === 3 && v.every((n) => Number.isInteger(n) && n >= 0 && n <= 255);

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/i;
const ehCor = (v) => typeof v === 'string' && (HEX.test(v) || RGB.test(v));

const mostrar = (v) => {
  if (typeof v === 'string') return `"${v}"`;
  if (typeof v === 'object' && v !== null) return JSON.stringify(v);
  return String(v);
};

export function validarParametros(p) {
  if (!ehObjeto(p)) {
    return ['PARAMS não foi definido ou não é um objeto.'];
  }

  const erros = [];
  const exigir = (ok, mensagem) => {
    if (!ok) erros.push(mensagem);
  };

  const secao = (nome, conferir) => {
    if (!ehObjeto(p[nome])) {
      erros.push(`${nome} está faltando ou não é um objeto.`);
      return;
    }
    conferir(p[nome]);
  };

  const conferirGrafico = (nome, g) => {
    exigir(ehTexto(g.titulo), `${nome}.titulo precisa ser um texto não vazio.`);
    exigir(
      ehRGB(g.cor),
      `${nome}.cor precisa ser [r, g, b] com inteiros de 0 a 255 (veio ${mostrar(g.cor)}).`,
    );
  };

  exigir(ehPositivo(p.largura), `largura precisa ser um número maior que zero (veio ${mostrar(p.largura)}).`);
  exigir(ehPositivo(p.altura), `altura precisa ser um número maior que zero (veio ${mostrar(p.altura)}).`);

  secao('tema', (tema) => {
    ['fundo', 'gradienteInicio', 'gradienteFim'].forEach((chave) => {
      exigir(
        ehCor(tema[chave]),
        `tema.${chave} não é uma cor válida, use hex ou rgb/rgba (veio ${mostrar(tema[chave])}).`,
      );
    });
    exigir(
      Number.isInteger(tema.casasDecimais) && tema.casasDecimais >= 0,
      `tema.casasDecimais precisa ser um inteiro maior ou igual a zero (veio ${mostrar(tema.casasDecimais)}).`,
    );
  });

  secao('estilo', (estilo) => {
    ['margemTopo', 'margemVertical', 'borda'].forEach((chave) => {
      exigir(
        ehNaoNegativo(estilo[chave]),
        `estilo.${chave} precisa ser um número maior ou igual a zero (veio ${mostrar(estilo[chave])}).`,
      );
    });
    exigir(
      ehPositivo(estilo.tamanhoTitulo),
      `estilo.tamanhoTitulo precisa ser um número maior que zero (veio ${mostrar(estilo.tamanhoTitulo)}).`,
    );
  });

  const mesesOk = Array.isArray(p.meses) && p.meses.length > 0 && p.meses.every(ehTexto);
  const vendasOk = Array.isArray(p.vendas) && p.vendas.length > 0 && p.vendas.every(ehNumero);
  exigir(mesesOk, `meses precisa ser uma lista de textos com pelo menos um item (veio ${mostrar(p.meses)}).`);
  exigir(vendasOk, `vendas precisa ser uma lista de números com pelo menos um item (veio ${mostrar(p.vendas)}).`);
  if (mesesOk && vendasOk) {
    exigir(
      p.meses.length === p.vendas.length,
      `meses tem ${p.meses.length} itens e vendas tem ${p.vendas.length}, as duas listas precisam ter o mesmo tamanho.`,
    );
  }

  secao('linha', (linha) => {
    conferirGrafico('linha', linha);
    exigir(ehPositivo(linha.espessura), `linha.espessura precisa ser um número maior que zero (veio ${mostrar(linha.espessura)}).`);
  });

  secao('progresso', (progresso) => {
    conferirGrafico('progresso', progresso);
    const ok =
      Array.isArray(progresso.valores) &&
      progresso.valores.length > 0 &&
      progresso.valores.every((v) => ehNumero(v) && v >= 0 && v <= 1);
    exigir(ok, `progresso.valores precisa ser uma lista de números entre 0 e 1 (veio ${mostrar(progresso.valores)}).`);
  });

  secao('barra', (barra) => {
    conferirGrafico('barra', barra);
    exigir(typeof barra.prefixoEixoY === 'string', 'barra.prefixoEixoY precisa ser um texto (pode ser vazio).');
  });

  secao('pizza', (pizza) => {
    conferirGrafico('pizza', pizza);
    exigir(ehNaoNegativo(pizza.borda), `pizza.borda precisa ser um número maior ou igual a zero (veio ${mostrar(pizza.borda)}).`);
    exigir(
      ehNaoNegativo(pizza.recuoEsquerda),
      `pizza.recuoEsquerda precisa ser um número maior ou igual a zero (veio ${mostrar(pizza.recuoEsquerda)}).`,
    );
    exigir(typeof pizza.mostrarAbsoluto === 'boolean', 'pizza.mostrarAbsoluto precisa ser true ou false.');

    if (!ehObjeto(pizza.legenda)) {
      erros.push('pizza.legenda está faltando ou não é um objeto.');
    } else {
      exigir(ehCor(pizza.legenda.cor), `pizza.legenda.cor não é uma cor válida (veio ${mostrar(pizza.legenda.cor)}).`);
      exigir(
        ehPositivo(pizza.legenda.tamanho),
        `pizza.legenda.tamanho precisa ser um número maior que zero (veio ${mostrar(pizza.legenda.tamanho)}).`,
      );
    }

    if (!Array.isArray(pizza.fatias) || pizza.fatias.length === 0) {
      erros.push('pizza.fatias precisa ser uma lista com pelo menos uma fatia.');
      return;
    }

    pizza.fatias.forEach((fatia, i) => {
      const onde = `pizza.fatias[${i}]`;
      if (!ehObjeto(fatia)) {
        erros.push(`${onde} não é um objeto.`);
        return;
      }
      exigir(ehTexto(fatia.nome), `${onde}.nome precisa ser um texto não vazio.`);
      exigir(ehNaoNegativo(fatia.valor), `${onde}.valor precisa ser um número maior ou igual a zero (veio ${mostrar(fatia.valor)}).`);
      exigir(ehCor(fatia.cor), `${onde}.cor não é uma cor válida (veio ${mostrar(fatia.cor)}).`);
    });

    const total = pizza.fatias.reduce((soma, f) => soma + (ehNumero(f?.valor) ? f.valor : 0), 0);
    exigir(total > 0, 'pizza.fatias precisa ter pelo menos uma fatia com valor maior que zero.');
  });

  return erros;
}

// ---------- componentes ----------

function montarConfig(tema, [r, g, b]) {
  return {
    backgroundColor: tema.fundo,
    backgroundGradientFrom: tema.gradienteInicio,
    backgroundGradientTo: tema.gradienteFim,
    decimalPlaces: tema.casasDecimais,
    color: (opacity = 1) => `rgba(${r}, ${g}, ${b}, ${opacity})`,
  };
}

function Bloco({ titulo, estilo, children }) {
  return (
    <View style={{ marginTop: estilo.margemTopo, alignItems: 'center' }}>
      <Text style={{ textAlign: 'center', fontSize: estilo.tamanhoTitulo }}>{titulo}</Text>
      {children}
    </View>
  );
}

const MyLineChart = ({ titulo, rotulos, valores, cor, espessura, largura, altura, tema, estilo }) => (
  <Bloco titulo={titulo} estilo={estilo}>
    <LineChart
      data={{ labels: rotulos, datasets: [{ data: valores, strokeWidth: espessura }] }}
      width={largura}
      height={altura}
      chartConfig={montarConfig(tema, cor)}
      style={{ marginVertical: estilo.margemVertical, borderRadius: estilo.borda }}
    />
  </Bloco>
);

const MyProgressChart = ({ titulo, valores, cor, largura, altura, tema, estilo }) => (
  <Bloco titulo={titulo} estilo={estilo}>
    <ProgressChart
      data={valores}
      width={largura}
      height={altura}
      chartConfig={montarConfig(tema, cor)}
      style={{ marginVertical: estilo.margemVertical, borderRadius: estilo.borda }}
    />
  </Bloco>
);

const MyBarChart = ({ titulo, rotulos, valores, cor, prefixoEixoY, largura, altura, tema, estilo }) => (
  <Bloco titulo={titulo} estilo={estilo}>
    <BarChart
      data={{ labels: rotulos, datasets: [{ data: valores }] }}
      width={largura}
      height={altura}
      yAxisLabel={prefixoEixoY}
      chartConfig={montarConfig(tema, cor)}
      style={{ marginVertical: estilo.margemVertical, borderRadius: estilo.borda }}
    />
  </Bloco>
);

const MyPieChart = ({
  titulo,
  fatias,
  legenda,
  cor,
  borda,
  recuoEsquerda,
  mostrarAbsoluto,
  largura,
  altura,
  tema,
  estilo,
}) => {
  const dados = fatias.map((f) => ({
    name: f.nome,
    valor: f.valor,
    color: f.cor,
    legendFontColor: legenda.cor,
    legendFontSize: legenda.tamanho,
  }));

  return (
    <Bloco titulo={titulo} estilo={estilo}>
      <PieChart
        data={dados}
        accessor="valor"
        width={largura}
        height={altura}
        chartConfig={montarConfig(tema, cor)}
        style={{ marginVertical: estilo.margemVertical, borderRadius: borda }}
        backgroundColor="transparent"
        paddingLeft={String(recuoEsquerda)}
        absolute={mostrarAbsoluto}
      />
    </Bloco>
  );
};

function ListaDeErros({ erros }) {
  return (
    <ScrollView contentContainerStyle={styles.caixaErros}>
      <Text style={styles.tituloErros}>Não foi possível montar os gráficos</Text>
      <Text style={styles.subtituloErros}>
        {erros.length === 1 ? 'Corrija o problema abaixo' : `Corrija os ${erros.length} problemas abaixo`} no
        objeto PARAMS:
      </Text>
      {erros.map((erro) => (
        <Text key={erro} style={styles.erro} testID="erro-parametro">
          {`• ${erro}`}
        </Text>
      ))}
    </ScrollView>
  );
}

export default function App({ params = PARAMS }) {
  const erros = validarParametros(params);

  if (erros.length > 0) {
    return (
      <View style={styles.tela}>
        <StatusBar style="auto" />
        <ListaDeErros erros={erros} />
      </View>
    );
  }

  const { largura, altura, tema, estilo, meses, vendas, linha, progresso, barra, pizza } = params;
  const comum = { largura, altura, tema, estilo };

  return (
    <View style={styles.tela}>
      <StatusBar style="auto" />
      <ScrollView>
        <MyLineChart {...comum} {...linha} rotulos={meses} valores={vendas} />
        <MyProgressChart {...comum} {...progresso} />
        <MyPieChart {...comum} {...pizza} />
        <MyBarChart {...comum} {...barra} rotulos={meses} valores={vendas} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    paddingTop: 32,
    backgroundColor: '#fff',
  },
  caixaErros: {
    padding: 16,
  },
  tituloErros: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#b00020',
    marginBottom: 8,
  },
  subtituloErros: {
    fontSize: 15,
    marginBottom: 12,
  },
  erro: {
    fontSize: 14,
    color: '#b00020',
    marginBottom: 6,
  },
});
