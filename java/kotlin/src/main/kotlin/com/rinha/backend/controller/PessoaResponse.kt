package com.rinha.backend.controller

import com.rinha.backend.model.Pessoa

class PessoaResponse(pessoa: Pessoa) {
  val id: String
  val apelido: String
  val nome: String
  val nascimento: String
  val stack: List<String>

  init {
    this.id = pessoa.id
    this.apelido = pessoa.apelido
    this.nome = pessoa.nome
    this.nascimento = pessoa.nascimento
    if (pessoa.stack != null) {
      this.stack = pessoa.stack?.split("|")?.stream()?.map(String::trim)?.toList()!!
    } else {
      this.stack = listOf()
    }
  }
}
