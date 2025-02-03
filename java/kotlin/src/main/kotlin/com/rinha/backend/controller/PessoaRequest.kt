package com.rinha.backend.controller

data class PessoaRequest(
  val apelido: String,
  val nome: String,
  val nascimento: String,
  val stack: Array<String>?
) {
  init {
    require(apelido.length in 1..32)
    require(nome.length in 1..100)
    val regex = Regex("^[0-9]{4}(-[0-9]{2}){2}\$")
    require(regex.containsMatchIn(nascimento))
    stack?.forEach {
      require(it.length in 1..32)
    }
  }
}
