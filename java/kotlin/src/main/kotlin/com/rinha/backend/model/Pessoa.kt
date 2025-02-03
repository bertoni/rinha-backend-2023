package com.rinha.backend.model

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "pessoa")
data class Pessoa(
  @Id
  val id: String,
  val apelido: String,
  val nome: String,
  val nascimento: String,
  val stack: String?,
  val searchable: String
)
