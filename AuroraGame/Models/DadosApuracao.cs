using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace AuroraGame.Models
{
    public class DadosApuracao
    {
        [JsonConverter(typeof(StringEnumConverter))]
        public Enum.Categoria Categoria { get; set; }
        public List<Dado> Dados { get; set; }
    }
}