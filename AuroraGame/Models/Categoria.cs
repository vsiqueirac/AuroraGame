using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AuroraGame.Models
{
    public class Categoria
    {
        public Enum.Categoria NomeCategoria { get; set; }
        public int Pontuacao { get; set; }

        public static Categoria RetornarPontuacaoCategoria(List<Dado> _dados, Enum.Categoria _categoriaSelecionada)
        {
            var pontuacaoFinal = new List<Categoria>();
            var dadosAgrupados = _dados.GroupBy(a => a.Valor)
                         .Select(g => new { g.Key, Count = g.Count() });

            //Uns
            if (dadosAgrupados.Any(a => a.Key == 1 && a.Count > 0))
                pontuacaoFinal.Add(new Categoria() { NomeCategoria = Enum.Categoria.Uns, Pontuacao = _dados.Where(a => a.Valor == 1).Sum(a => a.Valor) });

            //Dois
            if (dadosAgrupados.Any(a => a.Key == 2 && a.Count > 0))
                pontuacaoFinal.Add(new Categoria() { NomeCategoria = Enum.Categoria.Dois, Pontuacao = _dados.Where(a => a.Valor == 2).Sum(a => a.Valor) });

            //Tres
            if (dadosAgrupados.Any(a => a.Key == 3 && a.Count > 0))
                pontuacaoFinal.Add(new Categoria() { NomeCategoria = Enum.Categoria.Tres, Pontuacao = _dados.Where(a => a.Valor == 3).Sum(a => a.Valor) });

            //Quatros
            if (dadosAgrupados.Any(a => a.Key == 4 && a.Count > 0))
                pontuacaoFinal.Add(new Categoria() { NomeCategoria = Enum.Categoria.Quatros, Pontuacao = _dados.Where(a => a.Valor == 4).Sum(a => a.Valor) });

            //Cincos
            if (dadosAgrupados.Any(a => a.Key == 5 && a.Count > 0))
                pontuacaoFinal.Add(new Categoria() { NomeCategoria = Enum.Categoria.Cincos, Pontuacao = _dados.Where(a => a.Valor == 5).Sum(a => a.Valor) });

            //Seis
            if (dadosAgrupados.Any(a => a.Key == 6 && a.Count > 0))
                pontuacaoFinal.Add(new Categoria() { NomeCategoria = Enum.Categoria.Seis, Pontuacao = _dados.Where(a => a.Valor == 6).Sum(a => a.Valor) });

            //Par
            if (dadosAgrupados.Count(a => (a.Key == 1 || a.Key == 2 || a.Key == 3 || a.Key == 4 || a.Key == 5 || a.Key == 6) && a.Count == 2) == 1)
                pontuacaoFinal.Add(new Categoria() { NomeCategoria = Enum.Categoria.Par, Pontuacao = dadosAgrupados.Where(a => (a.Key == 1 || a.Key == 2 || a.Key == 3 || a.Key == 4 || a.Key == 5 || a.Key == 6) && a.Count == 2).Sum(b => b.Key * b.Count) });

            //DoisPares
            if (dadosAgrupados.Count(a => (a.Key == 1 || a.Key == 2 || a.Key == 3 || a.Key == 4 || a.Key == 5 || a.Key == 6) && a.Count == 2) == 2)
                pontuacaoFinal.Add(new Categoria() { NomeCategoria = Enum.Categoria.DoisPares, Pontuacao = dadosAgrupados.Where(a => (a.Key == 1 || a.Key == 2 || a.Key == 3 || a.Key == 4 || a.Key == 5 || a.Key == 6) && a.Count == 2).Sum(b => b.Key * b.Count) });

            //Trio
            if (dadosAgrupados.Count(a => (a.Key == 1 || a.Key == 2 || a.Key == 3 || a.Key == 4 || a.Key == 5 || a.Key == 6) && a.Count == 3) == 1)
                pontuacaoFinal.Add(new Categoria() { NomeCategoria = Enum.Categoria.Trio, Pontuacao = dadosAgrupados.Where(a => (a.Key == 1 || a.Key == 2 || a.Key == 3 || a.Key == 4 || a.Key == 5 || a.Key == 6) && a.Count == 3).Sum(b => b.Key * b.Count) });

            //Quadra
            if (dadosAgrupados.Any(a => a.Count == 4))
                pontuacaoFinal.Add(new Categoria() { NomeCategoria = Enum.Categoria.SequenciaMenor, Pontuacao = dadosAgrupados.Where(a => a.Count == 1).Sum(b => b.Key * b.Count) });

            //SequenciaMaior
            if (dadosAgrupados.Count(a => a.Count == 1) == 5
                && (!dadosAgrupados.Any(a => a.Key == 1) || !dadosAgrupados.Any(a => a.Key == 6)))
                pontuacaoFinal.Add(new Categoria() { NomeCategoria = Enum.Categoria.SequenciaMaior, Pontuacao = 20 });

            //SequenciaMenor
            if (!pontuacaoFinal.Any(a => a.NomeCategoria == Enum.Categoria.SequenciaMaior)
                && dadosAgrupados.Count(a => a.Count >= 1) >= 4
                && (!(dadosAgrupados.Any(a => a.Key == 1) && dadosAgrupados.Any(a => a.Key == 6))
                || !(dadosAgrupados.Any(a => a.Key == 1) && dadosAgrupados.Any(a => a.Key == 2))
                || !(dadosAgrupados.Any(a => a.Key == 5) && dadosAgrupados.Any(a => a.Key == 6))
                ))
                pontuacaoFinal.Add(new Categoria() { NomeCategoria = Enum.Categoria.SequenciaMenor, Pontuacao = 15 });

            //FullHouse
            if (pontuacaoFinal.Any(a => a.NomeCategoria == Enum.Categoria.Par) && pontuacaoFinal.Any(a => a.NomeCategoria == Enum.Categoria.Trio))
                pontuacaoFinal.Add(new Categoria() { NomeCategoria = Enum.Categoria.FullHouse, Pontuacao = dadosAgrupados.Sum(b => b.Key * b.Count) });

            //Aurora
            if (dadosAgrupados.Any(a => a.Count == 5))
                pontuacaoFinal.Add(new Categoria() { NomeCategoria = Enum.Categoria.Aurora, Pontuacao = 50 });

            return pontuacaoFinal.FirstOrDefault(a => a.NomeCategoria == _categoriaSelecionada);
        }
    }
}