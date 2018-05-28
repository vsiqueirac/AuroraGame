using AuroraGame.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace AuroraGame.Controllers
{
    public class ApuracaoController : ApiController
    {
        [HttpPost]
        public string Post([FromBody] DadosApuracao dadosApuracao)
        {
            var pontuacaoCategorias = Models.Categoria.RetornarPontuacaoCategoria(dadosApuracao.Dados, dadosApuracao.Categoria);

            return string.Format("A pontuação do jogador, de acordo com a categoria selecionada é: {0}", pontuacaoCategorias?.Pontuacao ?? 0);
        }
    }
}